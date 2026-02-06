import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetAppointment } from '../../../tanstack/useAppointments';
import { useServicePayment } from '../../../tanstack/usePayments';
import { formatCurrency } from '../../../utils/paymentUtils';

/**
 * FinishPayment Component
 * 
 * Allows payment of remaining amount for an appointment.
 * Features:
 * - Payment method selection (MPESA/CARD)
 * - Navigates to payment status page after initiation
 */
const FinishPayment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data } = useGetAppointment(id || '');
  const servicePayment = useServicePayment();

  const appointment = (data as any)?.appointment ?? data;
  const [method, setMethod] = useState<'MPESA' | 'CARD'>('MPESA');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (!appointment || appointment.remainingAmount <= 0 || !method || isSubmitting) return false;
    if (method === 'MPESA') return Boolean(phone?.trim());
    if (method === 'CARD') return Boolean(email?.trim());
    return false;
  }, [appointment, method, phone, email, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !id) return;

    setIsSubmitting(true);
    try {
      const result = await servicePayment.mutateAsync({
        appointmentId: id,
        method,
        phone: method === 'MPESA' ? phone : undefined,
        email: method === 'CARD' ? email : undefined,
      });

      const paymentId = result.payment?._id || result.paymentId;
      const checkoutId = result.gateway?.checkoutRequestId;
      navigate(`/payments/status?paymentId=${paymentId}${checkoutId ? `&checkoutId=${checkoutId}` : ''}`);
    } catch (error: any) {
      setInlineMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to initiate payment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appointment) {
    return <div className="alert-error">Appointment not found.</div>;
  }

  if (appointment.remainingAmount <= 0) {
    return (
      <div className="space-y-4">
        <div className="alert-error">No remaining amount to pay.</div>
        <Link to={`/appointments/${id}`} className="btn-secondary">
          Back to Appointment
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Finish Payment</h1>
        <p className="mt-1 text-sm text-gray-500">Pay remaining amount for appointment.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-lg font-semibold text-gray-900">
            Remaining Amount: {formatCurrency(appointment.remainingAmount, 'KES')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Payment Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as 'MPESA' | 'CARD')} className="input-select">
              <option value="MPESA">M-Pesa</option>
              <option value="CARD">Card (Paystack)</option>
            </select>
          </div>

          {method === 'MPESA' && (
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254712345678"
                className="input"
                required
              />
            </div>
          )}

          {method === 'CARD' && (
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="input"
                required
              />
            </div>
          )}

          {inlineMessage && (
            <div className={`alert-${inlineMessage.type}`}>{inlineMessage.text}</div>
          )}

          <div className="flex gap-3">
            <Link to={`/appointments/${id}`} className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={!canSubmit} className="btn-primary">
              {isSubmitting ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinishPayment;
