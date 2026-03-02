import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { useGetPaymentById, useQueryMpesaStatus } from '../../../tanstack/usePayments';
import { API_BASE_URL } from '../../../api/config';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatCurrency, isMpesaPayment } from '../../../utils/paymentUtils';
import { formatDateTime } from '../../../utils/userUtils';

type PaymentStatusType = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

const statusVariantMap: Record<
  string,
  {
    label: string;
    variant: 'default' | 'info' | 'success' | 'warning' | 'error';
    icon: string;
  }
> = {
  pending: { label: 'Pending', variant: 'info', icon: 'schedule' },
  processing: { label: 'Processing', variant: 'info', icon: 'sync' },
  completed: { label: 'Completed', variant: 'success', icon: 'check-circle' },
  failed: { label: 'Failed', variant: 'error', icon: 'error' },
  cancelled: { label: 'Cancelled', variant: 'error', icon: 'cancel' },
};

const FALLBACK_TIMEOUT = 60000; // 60 seconds for M-Pesa fallback query

/**
 * PaymentStatus Component
 * 
 * Real-time payment status tracking page with Socket.IO integration.
 * Features:
 * - Socket.IO real-time updates for payment status
 * - M-Pesa callback handling with result code mapping
 * - Paystack payment status updates
 * - Fallback query after 60 seconds for M-Pesa if no callback received
 * - Connection status display
 * - Navigation to payment details on completion
 */
export default function PaymentStatus() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId') || '';
  const checkoutId = searchParams.get('checkoutId') || '';

  const { data, isLoading, error } = useGetPaymentById(paymentId);
  const { refetch: refetchMpesaStatus } = useQueryMpesaStatus(checkoutId || '', {
    enabled: false, // Only fetch when manually triggered after 60 seconds
  });

  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<PaymentStatusType | null>(null);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const payment = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.payment ?? root?.payment ?? root?.data ?? root;
  }, [data]);

  // Use socket status if available, otherwise use payment status
  const currentStatus = useMemo(() => {
    if (socketStatus) return socketStatus;
    const status = (payment?.status ?? 'pending').toLowerCase();
    if (status === 'success' || status === 'completed') return 'completed';
    if (status === 'failed') return 'failed';
    if (status === 'pending') return 'processing';
    return 'pending' as PaymentStatusType;
  }, [payment?.status, socketStatus]);

  const statusConfig = statusVariantMap[currentStatus] ?? statusVariantMap.pending;
  const isMpesa = isMpesaPayment(payment) || !!checkoutId;
  const isCompleted = currentStatus === 'completed';
  const isFailed = currentStatus === 'failed' || currentStatus === 'cancelled';

  // Clear all timers and connections
  const clearPaymentTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch (err) {
        console.error('Error disconnecting Socket.IO:', err);
      }
      socketRef.current = null;
    }
  }, []);

  // Handle M-Pesa result codes
  const handleMpesaResultCode = useCallback(
    (resultCode: number, resultMessage: string) => {
      clearPaymentTimers();

      switch (resultCode) {
        case 0: {
          // SUCCESS
          setSocketStatus('completed');
          break;
        }
        case 1: {
          setSocketStatus('failed');
          setSocketError('Insufficient M-Pesa balance');
          break;
        }
        case 1032: {
          setSocketStatus('cancelled');
          setSocketError('Payment cancelled by user');
          break;
        }
        case 1037: {
          setSocketStatus('failed');
          setSocketError('Payment timeout - could not reach your phone');
          break;
        }
        case 2001: {
          setSocketStatus('failed');
          setSocketError('Wrong PIN entered');
          break;
        }
        case 1001: {
          setSocketStatus('failed');
          setSocketError('Unable to complete transaction');
          break;
        }
        case 1019: {
          setSocketStatus('failed');
          setSocketError('Transaction expired');
          break;
        }
        case 1025: {
          setSocketStatus('failed');
          setSocketError('Invalid phone number');
          break;
        }
        case 1026: {
          setSocketStatus('failed');
          setSocketError('System error occurred');
          break;
        }
        case 1036: {
          setSocketStatus('failed');
          setSocketError('Internal error occurred');
          break;
        }
        case 1050: {
          setSocketStatus('failed');
          setSocketError('Too many payment attempts');
          break;
        }
        case 9999: {
          // Keep waiting - don't clear timers
          setSocketStatus('processing');
          break;
        }
        default: {
          setSocketStatus('failed');
          setSocketError(resultMessage || `Transaction failed with code ${resultCode}`);
          break;
        }
      }
    },
    [clearPaymentTimers]
  );

  // Start payment tracking function using Socket.IO
  const startTracking = useCallback(
    (trackingPaymentId: string = paymentId, trackingMethod: string = isMpesa ? 'mpesa' : 'paystack') => {
      clearPaymentTimers();

      // Only connect Socket.IO for M-Pesa and Paystack
      const shouldConnectSocket = ['mpesa', 'paystack'].includes(trackingMethod);
      if (!shouldConnectSocket) {
        console.log(`Skipping socket connection for method: ${trackingMethod}`);
        return;
      }

      // Socket.IO connection for real-time updates
      try {
        socketRef.current = io(API_BASE_URL, {
          transports: ['websocket'],
          forceNew: true,
          timeout: 20000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketRef.current.on('connect', () => {
          console.log('Socket.IO connected, subscribing to payment:', trackingPaymentId);
          setSocketConnected(true);
          setSocketError(null);

          // Subscribe to payment updates
          socketRef.current?.emit('subscribe-to-payment', String(trackingPaymentId));
        });

        socketRef.current.on('disconnect', () => {
          console.log('Socket.IO disconnected');
          setSocketConnected(false);
        });

        socketRef.current.on('connect_error', (err) => {
          console.error('Socket.IO connection error:', err);
          setSocketError('Socket.IO connection error');
          setSocketConnected(false);
        });

        // M-PESA LISTENERS
        if (trackingMethod === 'mpesa') {
          socketRef.current.on('callback.received', (payload: any) => {
            console.log('M-Pesa callback received:', payload);

            const resultCode = payload.CODE ?? payload.code ?? payload.resultCode;
            const resultMessage = payload.message || payload.resultDesc || 'Payment processing completed';
            handleMpesaResultCode(Number(resultCode), resultMessage);
          });

          socketRef.current.on('payment.updated', (payload: any) => {
            if (!payload || String(payload.paymentId) !== String(trackingPaymentId)) return;
            console.log('Database payment update:', payload);

            if (payload.status) {
              const status = payload.status.toLowerCase() as PaymentStatusType;
              setSocketStatus(status);

              if (status === 'completed' || status === 'failed' || status === 'cancelled') {
                clearPaymentTimers();
              }
            }
          });
        }

        // PAYSTACK LISTENERS
        if (trackingMethod === 'paystack') {
          socketRef.current.on('payment.updated', (payload: any) => {
            if (!payload || String(payload.paymentId) !== String(trackingPaymentId)) return;

            if (payload.status === 'completed' || payload.status === 'SUCCESS' || payload.status === 'PAID') {
              clearPaymentTimers();
              setSocketStatus('completed');
            } else if (payload.status === 'failed' || payload.status === 'FAILED') {
              clearPaymentTimers();
              setSocketStatus('failed');
              setSocketError(payload.message || 'Card payment failed');
            } else {
              const status = payload.status?.toLowerCase() as PaymentStatusType;
              setSocketStatus(status || 'processing');
            }
          });
        }
      } catch (err) {
        console.error('Error creating Socket.IO connection:', err);
        setSocketError('Failed to connect to Socket.IO');
      }

      // Fallback: Query M-Pesa status after 60 seconds (M-PESA ONLY)
      if (trackingMethod === 'mpesa' && checkoutId) {
        timeoutRef.current = setTimeout(async () => {
          try {
            setIsFallbackActive(true);
            console.log('Fallback: Querying M-Pesa status from Safaricom...');

            const res = await refetchMpesaStatus();
            const responseData = res?.data?.data ?? res?.data ?? res;
            // Backend returns { payment: {...}, status: { ok, resultCode, resultDesc, error, details } }
            const statusData = responseData?.status ?? responseData;
            // resultCode can be string "0" or number 0, parse it
            const resultCodeStr = statusData?.resultCode ?? statusData?.raw?.ResultCode ?? statusData?.CODE;
            const resultCode = typeof resultCodeStr === 'string' ? parseInt(resultCodeStr, 10) : (resultCodeStr ?? -1);
            const resultDesc = statusData?.resultDesc ?? statusData?.raw?.ResultDesc ?? statusData?.message ?? 'Payment status unknown';

            console.log('Fallback Query Result:', { resultCode, resultDesc, responseData });

            handleMpesaResultCode(resultCode, resultDesc);
          } catch (error) {
            console.error('Fallback query error:', error);
            setSocketStatus('failed');
            setSocketError('Could not verify payment status. You can retry the payment.');
          } finally {
            setIsFallbackActive(false);
            clearPaymentTimers();
          }
        }, FALLBACK_TIMEOUT);
      }
    },
    [
      paymentId,
      isMpesa,
      checkoutId,
      clearPaymentTimers,
      handleMpesaResultCode,
      refetchMpesaStatus,
    ]
  );

  // Initialize payment tracking
  useEffect(() => {
    if (!paymentId) return;

    const method = isMpesa ? 'mpesa' : 'paystack';
    startTracking(paymentId, method);

    return () => {
      clearPaymentTimers();
    };
  }, [paymentId, isMpesa, checkoutId, startTracking, clearPaymentTimers]);

  const handleViewDetails = useCallback(() => {
    if (paymentId) {
      navigate(`/payments/${paymentId}`);
    }
  }, [paymentId, navigate]);

  const handleRetry = useCallback(() => {
    navigate('/payments');
  }, [navigate]);

  if (!paymentId) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-6">
        <div className="alert-error w-full max-w-md">Payment ID is missing.</div>
      </div>
    );
  }

  if (isLoading && !payment) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500">Loading payment status...</div>
      </div>
    );
  }

  const errorMessage =
    (error as any)?.response?.data?.message ?? (error as Error)?.message ?? null;

  const amount = payment?.amount ?? 0;
  const currency = payment?.currency ?? 'KES';
  const paymentNumber = payment?.paymentNumber ?? `Payment ${paymentId.slice(0, 8)}`;

  return (
    <div className="space-y-6">
      <div className="px-6 py-6 gap-6">
        <div className="gap-3">
          <div className="flex-row items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Payment Status</h1>
              <p className="text-gray-600 mt-1">{paymentNumber}</p>
            </div>
            <div className="flex-row items-center gap-2">
              {payment?.method && (
                <StatusBadge status={payment.method} type="payment-method" />
              )}
              <span className={`badge badge-${statusConfig.variant}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
          {errorMessage ? (
            <div className="alert-error w-full">{errorMessage}</div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="items-center gap-4">
            {!isCompleted && !isFailed ? (
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary"></div>
            ) : isCompleted ? (
              <div className="text-6xl text-green-600">✓</div>
            ) : (
              <div className="text-6xl text-red-600">✗</div>
            )}
            <div className="items-center gap-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                {isCompleted
                  ? 'Payment Completed'
                  : isFailed
                  ? 'Payment Failed'
                  : 'Processing Payment'}
              </h2>
              <p className="text-base text-gray-600 text-center">
                {isCompleted
                  ? 'Your payment has been successfully processed.'
                  : isFailed
                  ? socketError || 'The payment could not be completed. Please try again.'
                  : isMpesa && socketConnected
                  ? 'Waiting for payment confirmation via M-Pesa...'
                  : isMpesa && !socketConnected
                  ? 'Connecting to payment gateway...'
                  : 'Checking payment status...'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
          <div className="gap-3">
            <div className="flex-row items-center justify-between gap-3">
              <span className="text-sm text-gray-500">Amount</span>
              <span className="text-base font-medium text-gray-900">
                {formatCurrency(amount, currency)}
              </span>
            </div>
            <div className="flex-row items-center justify-between gap-3">
              <span className="text-sm text-gray-500">Date</span>
              <span className="text-base text-gray-900">
                {formatDateTime(payment?.createdAt)}
              </span>
            </div>
            {isMpesa && checkoutId && (
              <div className="flex-row items-center justify-between gap-3">
                <span className="text-sm text-gray-500">Checkout ID</span>
                <span className="text-base text-gray-900 font-mono text-sm">{checkoutId}</span>
              </div>
            )}
            {payment?.transactionRef && (
              <div className="flex-row items-center justify-between gap-3">
                <span className="text-sm text-gray-500">Transaction Reference</span>
                <span className="text-base text-gray-900 font-mono text-sm">{payment.transactionRef}</span>
              </div>
            )}
          </div>
        </div>

        {isMpesa && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h2>
            <div className="gap-3">
              <div className="flex-row items-center justify-between">
                <span className="text-sm text-gray-600">Socket.IO</span>
                <span className={`badge badge-${socketConnected ? 'success' : 'default'}`}>
                  {socketConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {isFallbackActive && (
                <div className="flex-row items-center justify-between">
                  <span className="text-sm text-gray-600">Checking payment status...</span>
                  <span className="badge badge-info">Active</span>
                </div>
              )}
              {socketError && (
                <div className="alert-error w-full">{socketError}</div>
              )}
            </div>
          </div>
        )}

        <div className="flex-row flex-wrap gap-3">
          <button onClick={handleViewDetails} className="btn-primary flex-1">
            View Details
          </button>
          {isFailed && (
            <button onClick={handleRetry} className="btn-secondary flex-1">
              Retry Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
