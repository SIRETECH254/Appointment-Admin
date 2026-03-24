import { useCallback, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiScissors, FiCalendar, FiClock, FiDollarSign, FiAlertTriangle, FiXCircle, FiCreditCard, FiTrendingUp, FiFileText } from 'react-icons/fi';
import { useGetAppointment, useCancelAppointment, useCheckInAppointment, useCompleteAppointment, useMarkNoShowAppointment } from '../../../tanstack/useAppointments';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatAppointmentDateTime, canRescheduleAppointment, canCancelAppointment, canCheckInAppointment, getAppointmentStaffName } from '../../../utils/appointmentUtils';
import { formatCurrency } from '../../../utils/paymentUtils';
import type { IUser, IAppointmentService } from '../../../types/api.types';

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

  const appointment = data?.appointment;
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<'cancel' | 'no-show' | null>(null);
  const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const status = String(appointment?.status || '').toUpperCase();
  const canReschedule = canRescheduleAppointment(appointment);
  const canCancel = canCancelAppointment(appointment);
  const canCheckIn = canCheckInAppointment(appointment);
  const hasRemainingAmount = (appointment?.remainingAmount || 0) > 0;
  const isConfirmed = status === 'CONFIRMED';
  const isCheckedIn = !!appointment?.checkedInAt;
  const isPending = status === 'PENDING';

  // Get staff info for avatar
  const staffUser = useMemo(() => {
    if (!appointment) return null;
    return typeof appointment.staffId === 'object' ? appointment.staffId as IUser : null;
  }, [appointment]);

  const staffName = useMemo(() => {
    if (!appointment) return 'Unknown Staff';
    return getAppointmentStaffName(appointment);
  }, [appointment]);

  const staffInitials = useMemo(() => {
    if (!staffUser) return 'U';
    const firstName = staffUser.firstName || '';
    const lastName = staffUser.lastName || '';
    const letters = [firstName, lastName]
      .filter(Boolean)
      .map((value: string) => value[0]?.toUpperCase())
      .join('');
    return letters || 'U';
  }, [staffUser]);

  // Get services as array
  const services = useMemo(() => {
    if (!appointment || !appointment.services) return [];
    return appointment.services.map((service: string | IAppointmentService) => {
      if (typeof service === 'object' && service !== null) {
        return (service as IAppointmentService).name || 'Service';
      }
      return 'Service';
    });
  }, [appointment]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (!appointment) return 0;
    return (appointment.bookingFeeAmount || 0) + (appointment.remainingAmount || 0);
  }, [appointment]);

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
      setInlineMessage({ type: 'error', text: error?.response?.data?.message ?? 'An error occurred' });
    }
  }, [id, actionToConfirm, cancelAppointment, markNoShowAppointment]);

  const handleCheckIn = useCallback(async () => {
    if (!id) return;
    try {
      await checkInAppointment.mutateAsync(id);
      setInlineMessage({ type: 'success', text: 'Customer checked in successfully.' });
    } catch (error: any) {
      setInlineMessage({ type: 'error', text: error?.response?.data?.message ?? 'An error occurred' });
    }
  }, [id, checkInAppointment]);

  const handleComplete = useCallback(async () => {
    if (!id) return;
    try {
      await completeAppointment.mutateAsync(id);
      setInlineMessage({ type: 'success', text: 'Appointment completed successfully.' });
    } catch (error: any) {
      setInlineMessage({ type: 'error', text: error?.response?.data?.message ?? 'An error occurred' });
    }
  }, [id, completeAppointment]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for header section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 animate-pulse rounded-full bg-gray-300" />
              <div className="space-y-2">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-300" />
                <div className="h-5 w-24 animate-pulse rounded-full bg-gray-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading skeleton for details section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-300 mb-4" />
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="h-5 w-5 animate-pulse rounded bg-gray-300 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-300" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading skeleton for payment section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-300 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <FiAlertTriangle className="mx-auto h-24 w-24 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Appointment</h2>
          <p className="text-gray-600 mb-6 ">{errorMessage}</p>
          <Link to="/appointments" className="btn-secondary">
            Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <FiXCircle className="mx-auto h-24 w-24 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Appointment Not Found</h2>
          <p className="text-gray-600 mb-6 ">The appointment you're looking for doesn't exist or has been removed.</p>
          <Link to="/appointments" className="btn-secondary">
            Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 items-center justify-center">
          <div className="flex items-center gap-4">
            {staffUser?.avatar ? (
              <img
                src={staffUser.avatar}
                alt={`${staffName} avatar`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-xl font-semibold text-white">
                {staffInitials}
              </div>
            )}
          <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Appointment #{appointment?.appointmentNumber}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{staffName}</p>
              <div className="mt-3">
                <StatusBadge status={appointment.status} type="appointment-status" />
              </div>
          </div>
          </div>
        </div>
      </div>

      {/* Appointment Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Appointment Information</h2>
        </div>
        <div className="space-y-4">
          {/* Services */}
          <div className="flex items-start gap-3">
            <FiScissors className="mt-1 h-5 w-5 text-blue-500 shrink-0" />
            <div className="flex-1">
              <p className="text-xs uppercase text-gray-400 mb-1">Services</p>
              {services.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {services.map((service: string, index: number) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-700">No services</p>
              )}
            </div>
          </div>

          {/* Booked on */}
          <div className="flex items-start gap-3">
            <FiCalendar className="mt-1 h-5 w-5 text-green-500 shrink-0" />
            <div className="flex-1">
              <p className="text-xs uppercase text-gray-400 mb-1">Booked On</p>
              <p className="text-sm text-gray-700">
                {appointment.createdAt ? formatAppointmentDateTime(appointment.createdAt) : '—'}
              </p>
            </div>
          </div>

          {/* Date of appointment */}
          <div className="flex items-start gap-3">
            <FiClock className="mt-1 h-5 w-5 text-purple-500 shrink-0" />
            <div className="flex-1">
              <p className="text-xs uppercase text-gray-400 mb-1">Date of Appointment</p>
              <p className="text-sm text-gray-700">
                {formatAppointmentDateTime(appointment.startTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiDollarSign className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiCreditCard className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-gray-700">Booking Fee</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(appointment.bookingFeeAmount || 0, 'KES')}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiTrendingUp className="h-5 w-5 text-orange-500" />
              <p className="text-sm text-gray-700">Remaining</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(appointment.remainingAmount || 0, 'KES')}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <div className="flex items-center gap-3">
              <FiDollarSign className="h-5 w-5 text-green-500" />
              <p className="text-sm font-semibold text-gray-900">Total</p>
            </div>
            <p className="text-base font-bold text-gray-900">
              {formatCurrency(totalAmount, 'KES')}
            </p>
          </div>
        </div>
      </div>

      {inlineMessage && (
        <div className={`alert-${inlineMessage.type}`}>{inlineMessage.text}</div>
      )}

      {/* Actions Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiFileText className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
        </div>
        <div className="flex flex-row gap-3 w-full">
        {isPending && (
          <>
            <Link to={`/appointments/${id}/confirm`} className="btn-primary flex-1">
              Confirm Appointment
            </Link>
            {canReschedule && (
              <Link to={`/appointments/${id}/reschedule`} className="btn-secondary flex-1">
                Reschedule
              </Link>
            )}
            {canCancel && (
              <button onClick={handleCancel} className="btn-secondary flex-1">
                Cancel
              </button>
            )}
          </>
        )}

        {isConfirmed && !isCheckedIn && (
          <>
            <button onClick={handleCheckIn} className="btn-primary flex-1" disabled={!canCheckIn}>
              Check In
            </button>
            {canReschedule && (
              <Link to={`/appointments/${id}/reschedule`} className="btn-secondary flex-1">
                Reschedule
              </Link>
            )}
            {canCancel && (
              <button onClick={handleCancel} className="btn-secondary flex-1">
                Cancel
              </button>
            )}
            {hasRemainingAmount && (
              <Link to={`/appointments/${id}/finish-payment`} className="btn-primary flex-1">
                Finish Payment
              </Link>
            )}
          </>
        )}

        {isConfirmed && isCheckedIn && (
          <>
            <button onClick={handleComplete} className="btn-primary flex-1">
              Complete
            </button>
            <button onClick={handleNoShow} className="btn-secondary flex-1">
              Mark No-Show
            </button>
          </>
        )}
        </div>
      </div>

      <Link to="/appointments" className="btn-secondary w-full">
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
