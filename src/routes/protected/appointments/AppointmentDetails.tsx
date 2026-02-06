import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetAppointment, useCancelAppointment, useCheckInAppointment, useCompleteAppointment, useMarkNoShowAppointment } from '../../../tanstack/useAppointments';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { formatAppointmentDateTime, formatAppointmentStatus, getAppointmentStatusVariant, canRescheduleAppointment, canCancelAppointment, canCheckInAppointment, getAppointmentCustomerName, getAppointmentStaffName, getAppointmentServicesDisplay } from '../../../utils/appointmentUtils';
import { formatCurrency } from '../../../utils/paymentUtils';

/**
 * AppointmentDetails Component
 * 
 * Displays detailed information about a specific appointment with action buttons.
 * Features:
 * - Appointment information display
 * - Status-based action buttons (confirm, reschedule, cancel, check-in, complete, no-show, finish payment)
 * - Confirmation modals for destructive actions
 */
const AppointmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useGetAppointment(id || '');
  
  const cancelAppointment = useCancelAppointment();
  const checkInAppointment = useCheckInAppointment();
  const completeAppointment = useCompleteAppointment();
  const markNoShowAppointment = useMarkNoShowAppointment();

  const appointment = (data as any)?.appointment ?? data;
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<'cancel' | 'no-show' | null>(null);
  const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const status = String(appointment?.status || '').toUpperCase();
  const statusVariant = getAppointmentStatusVariant(appointment?.status || '');
  const canReschedule = canRescheduleAppointment(appointment);
  const canCancel = canCancelAppointment(appointment);
  const canCheckIn = canCheckInAppointment(appointment);
  const hasRemainingAmount = (appointment?.remainingAmount || 0) > 0;
  const isConfirmed = status === 'CONFIRMED';
  const isCheckedIn = !!appointment?.checkedInAt;
  const isPending = status === 'PENDING';

  const handleCancel = useCallback(() => {
    setActionToConfirm('cancel');
    setConfirmModalOpen(true);
  }, []);

  const handleNoShow = useCallback(() => {
    setActionToConfirm('no-show');
    setConfirmModalOpen(true);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!id || !actionToConfirm) return;

    try {
      if (actionToConfirm === 'cancel') {
        await cancelAppointment.mutateAsync({ appointmentId: id, data: {} });
        setInlineMessage({ type: 'success', text: 'Appointment cancelled successfully.' });
      } else if (actionToConfirm === 'no-show') {
        await markNoShowAppointment.mutateAsync(id);
        setInlineMessage({ type: 'success', text: 'Appointment marked as no-show.' });
      }
      setConfirmModalOpen(false);
      setActionToConfirm(null);
    } catch (error: any) {
      setInlineMessage({ type: 'error', text: error?.response?.data?.message || 'Action failed.' });
    }
  }, [id, actionToConfirm, cancelAppointment, markNoShowAppointment]);

  const handleCheckIn = useCallback(async () => {
    if (!id) return;
    try {
      await checkInAppointment.mutateAsync(id);
      setInlineMessage({ type: 'success', text: 'Customer checked in successfully.' });
    } catch (error: any) {
      setInlineMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to check in.' });
    }
  }, [id, checkInAppointment]);

  const handleComplete = useCallback(async () => {
    if (!id) return;
    try {
      await completeAppointment.mutateAsync(id);
      setInlineMessage({ type: 'success', text: 'Appointment completed successfully.' });
    } catch (error: any) {
      setInlineMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to complete appointment.' });
    }
  }, [id, completeAppointment]);

  if (isLoading) {
    return <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">Loading appointment...</div>;
  }

  if (isError || !appointment) {
    const errorMessage = (error as any)?.response?.data?.message || 'Failed to load appointment.';
    return (
      <div className="space-y-4">
        <div className="alert-error">{errorMessage}</div>
        <Link to="/appointments" className="btn-secondary">Back to Appointments</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Appointment Details</h1>
            <p className="text-sm text-gray-500 mt-1">Appointment #{appointment._id.slice(0, 8)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge badge-${statusVariant}`}>
              {formatAppointmentStatus(appointment.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-gray-400">Customer</p>
            <p className="text-sm text-gray-700">{getAppointmentCustomerName(appointment)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Staff</p>
            <p className="text-sm text-gray-700">{getAppointmentStaffName(appointment)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Date/Time</p>
            <p className="text-sm text-gray-700">{formatAppointmentDateTime(appointment.startTime)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Services</p>
            <p className="text-sm text-gray-700">{getAppointmentServicesDisplay(appointment)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Booking Fee</p>
            <p className="text-sm text-gray-700">{formatCurrency(appointment.bookingFeeAmount, 'KES')}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Remaining Amount</p>
            <p className="text-sm text-gray-700">{formatCurrency(appointment.remainingAmount, 'KES')}</p>
          </div>
        </div>
      </div>

      {inlineMessage && (
        <div className={`alert-${inlineMessage.type}`}>{inlineMessage.text}</div>
      )}

      <div className="flex flex-wrap gap-3">
        {isPending && (
          <>
            <Link to={`/appointments/${id}/confirm`} className="btn-primary">
              Confirm Appointment
            </Link>
            {canReschedule && (
              <Link to={`/appointments/${id}/reschedule`} className="btn-secondary">
                Reschedule
              </Link>
            )}
            {canCancel && (
              <button onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            )}
          </>
        )}

        {isConfirmed && !isCheckedIn && (
          <>
            <button onClick={handleCheckIn} className="btn-primary" disabled={!canCheckIn}>
              Check In
            </button>
            {canReschedule && (
              <Link to={`/appointments/${id}/reschedule`} className="btn-secondary">
                Reschedule
              </Link>
            )}
            {canCancel && (
              <button onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            )}
            {hasRemainingAmount && (
              <Link to={`/appointments/${id}/finish-payment`} className="btn-primary">
                Finish Payment
              </Link>
            )}
          </>
        )}

        {isConfirmed && isCheckedIn && (
          <>
            <button onClick={handleComplete} className="btn-primary">
              Complete
            </button>
            <button onClick={handleNoShow} className="btn-secondary">
              Mark No-Show
            </button>
          </>
        )}
      </div>

      <Link to="/appointments" className="btn-secondary">
        Back to Appointments
      </Link>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setActionToConfirm(null);
        }}
        onConfirm={handleConfirmAction}
        title={actionToConfirm === 'cancel' ? 'Cancel Appointment' : 'Mark No-Show'}
        message={
          actionToConfirm === 'cancel'
            ? 'Are you sure you want to cancel this appointment? This action cannot be undone.'
            : 'Are you sure you want to mark this appointment as no-show?'
        }
        confirmText={actionToConfirm === 'cancel' ? 'Cancel Appointment' : 'Mark No-Show'}
        cancelText="Keep Appointment"
        confirmButtonClass={actionToConfirm === 'cancel' ? 'btn-primary bg-red-600 hover:bg-red-700' : 'btn-primary'}
        isLoading={cancelAppointment.isPending || markNoShowAppointment.isPending}
      />
    </div>
  );
};

export default AppointmentDetails;
