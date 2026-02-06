import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetAppointment, useConfirmAppointment } from '../../../tanstack/useAppointments';
import { formatAppointmentDateTime } from '../../../utils/appointmentUtils';
import { formatCurrency } from '../../../utils/paymentUtils';

/**
 * ConfirmAppointment Component
 * 
 * Allows user to confirm an appointment by paying the booking fee.
 * Features:
 * - Payment method selection (MPESA/CARD)
 * - Phone input for MPESA, email for CARD
 * - Navigates to payment status page after initiation
 */
const ConfirmAppointment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data } = useGetAppointment(id || '');
  const confirmAppointment = useConfirmAppointment();

  const appointment = (data as any)?.appointment ?? data;
  const [method, setMethod] = useState<'MPESA' | 'CARD'>('MPESA');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (!method || isSubmitting) return false;
    if (method === 'MPESA') return Boolean(phone?.trim());
    if (method === 'CARD') return Boolean(email?.trim());
    return false;
  }, [method, phone, email, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !id) return;

    setIsSubmitting(true);
    try {
      const result = await confirmAppointment.mutateAsync({
        appointmentId: id,
        paymentData: {
          method,
          phone: method === 'MPESA' ? phone : undefined,
          email: method === 'CARD' ? email : undefined,
        },
      });

      const paymentId = result.payment?._id || result.paymentId;
      const checkoutId = result.gateway?.checkoutRequestId;
      navigate(`/payments/status?paymentId=${paymentId}${checkoutId ? `&checkoutId=${checkoutId}` : ''}`);
    } catch (error: any) {
      setInlineMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to confirm appointment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appointment) {
    return <div className="alert-error">Appointment not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Confirm Appointment</h1>
        <p className="mt-1 text-sm text-gray-500">Pay booking fee to confirm appointment.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-sm text-gray-600">Date/Time: {formatAppointmentDateTime(appointment.startTime)}</p>
          <p className="text-sm text-gray-600">Booking Fee: {formatCurrency(appointment.bookingFeeAmount, 'KES')}</p>
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
              {isSubmitting ? 'Processing...' : 'Confirm & Pay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmAppointment;
