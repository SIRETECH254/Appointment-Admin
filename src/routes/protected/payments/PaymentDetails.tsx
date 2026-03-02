import { Link, useParams } from 'react-router-dom';
import { FiDollarSign, FiCreditCard, FiTag, FiCheckCircle, FiCalendar, FiHash, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import { useGetPaymentById } from '../../../tanstack/usePayments';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatPaymentMethod, formatPaymentType, formatCurrency, getPaymentAppointmentId } from '../../../utils/paymentUtils';
import { formatDateTimeWithTime } from '../../../utils/userUtils';

/**
 * PaymentDetails Component
 * 
 * Displays detailed information about a specific payment.
 */
const PaymentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useGetPaymentById(id || '');

  const payment = (data as any)?.payment ?? (data as any)?.data?.payment ?? data;
  const statusVariant = getPaymentStatusVariant(payment?.status || '');
  const appointmentId = getPaymentAppointmentId(payment);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-48 bg-gray-300 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-300 rounded mb-4" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-300 rounded-full" />
            <div className="h-6 w-24 bg-gray-300 rounded-full" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-300 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !payment) {
    const errorMessage = (error as any)?.response?.data?.message || 'Failed to load payment.';
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <FiAlertTriangle className="h-16 w-16 text-red-500" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Payment</h2>
          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
        </div>
        <Link to="/payments" className="btn-secondary">Back to Payments</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Payment Details</h1>
            <p className="text-sm text-gray-500 mt-1">{payment.paymentNumber || `Payment #${payment._id.slice(0, 8)}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={payment.status} type="payment-status" />
            <span className="badge badge-soft">{formatPaymentMethod(payment.method)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiDollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Amount</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount, payment.currency || 'KES')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiCreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Method</p>
              <p className="text-sm text-gray-700">{formatPaymentMethod(payment.method)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiTag className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Type</p>
              <p className="text-sm text-gray-700">{formatPaymentType(payment.type)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiCheckCircle className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Status</p>
              <StatusBadge status={payment.status} type="payment-status" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiCalendar className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Payment Date</p>
              <p className="text-sm text-gray-700">{formatDateTimeWithTime(payment.createdAt)}</p>
            </div>
          </div>
          {payment.transactionRef && (
            <div className="flex items-start gap-3">
              <FiHash className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase text-gray-400 mb-1">Transaction Reference</p>
                <p className="text-sm text-gray-700 font-mono">{payment.transactionRef}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {appointmentId && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Appointment</h2>
          <Link to={`/appointments/${appointmentId}`} className="btn-primary">
            View Appointment
          </Link>
        </div>
      )}

      <Link to="/payments" className="btn-secondary">
        Back to Payments
      </Link>
    </div>
  );
};

export default PaymentDetails;
