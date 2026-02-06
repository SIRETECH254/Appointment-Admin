import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetAppointment, useRescheduleAppointment } from '../../../tanstack/useAppointments';
import { formatAppointmentDateTime } from '../../../utils/appointmentUtils';

/**
 * RescheduleAppointment Component
 * 
 * Allows rescheduling of a confirmed appointment.
 * Features:
 * - Date/time picker for new appointment time
 * - Validation for slot availability
 */
const RescheduleAppointment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data } = useGetAppointment(id || '');
  const rescheduleAppointment = useRescheduleAppointment();

  const appointment = (data as any)?.appointment ?? data;
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return Boolean(startTime && endTime && new Date(startTime) > new Date() && new Date(endTime) > new Date(startTime) && !isSubmitting);
  }, [startTime, endTime, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !id) return;

    setIsSubmitting(true);
    try {
      await rescheduleAppointment.mutateAsync({
        appointmentId: id,
        data: { startTime, endTime },
      });
      setInlineMessage({ type: 'success', text: 'Appointment rescheduled successfully.' });
      setTimeout(() => navigate(`/appointments/${id}`), 1200);
    } catch (error: any) {
      setInlineMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to reschedule appointment.' });
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
        <h1 className="text-2xl font-semibold text-gray-900">Reschedule Appointment</h1>
        <p className="mt-1 text-sm text-gray-500">Change the appointment date and time.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-sm text-gray-600">Current: {formatAppointmentDateTime(appointment.startTime)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">New Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">New End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input"
              required
            />
          </div>

          {inlineMessage && (
            <div className={`alert-${inlineMessage.type}`}>{inlineMessage.text}</div>
          )}

          <div className="flex gap-3">
            <Link to={`/appointments/${id}`} className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={!canSubmit} className="btn-primary">
              {isSubmitting ? 'Processing...' : 'Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleAppointment;
