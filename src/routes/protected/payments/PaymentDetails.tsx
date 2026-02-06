import { Link, useParams } from 'react-router-dom';
import { useGetPaymentById } from '../../../tanstack/usePayments';
import { formatPaymentStatus, getPaymentStatusVariant, formatPaymentMethod, formatPaymentType, formatCurrency, getPaymentAppointmentId } from '../../../utils/paymentUtils';
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
    return <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">Loading payment...</div>;
  }

  if (isError || !payment) {
    const errorMessage = (error as any)?.response?.data?.message || 'Failed to load payment.';
    return (
      <div className="space-y-4">
        <div className="alert-error">{errorMessage}</div>
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
            <span className={`badge badge-${statusVariant}`}>{formatPaymentStatus(payment.status)}</span>
            <span className="badge badge-soft">{formatPaymentMethod(payment.method)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-gray-400">Amount</p>
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount, payment.currency || 'KES')}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Method</p>
            <p className="text-sm text-gray-700">{formatPaymentMethod(payment.method)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Type</p>
            <p className="text-sm text-gray-700">{formatPaymentType(payment.type)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Status</p>
            <p className="text-sm text-gray-700">{formatPaymentStatus(payment.status)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Payment Date</p>
            <p className="text-sm text-gray-700">{formatDateTimeWithTime(payment.createdAt)}</p>
          </div>
          {payment.transactionRef && (
            <div>
              <p className="text-xs uppercase text-gray-400">Transaction Reference</p>
              <p className="text-sm text-gray-700 font-mono">{payment.transactionRef}</p>
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
