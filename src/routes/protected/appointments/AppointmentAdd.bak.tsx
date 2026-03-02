import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateAppointment } from '../../../tanstack/useAppointments';
import { useGetAllServices } from '../../../tanstack/useServices';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import { useGetSlots } from '../../../tanstack/useAvailability';
import type { ITimeSlot } from '../../../types/api.types';

/**
 * AppointmentAdd Component
 * 
 * Form to create a new appointment.
 * Features:
 * - Staff selection (independent)
 * - Service selection (independent, multi-select)
 * - Date picker
 * - Slot selection from availability API using TanStack Query
 * - Validation
 */
const AppointmentAdd = () => {
  const navigate = useNavigate();
  const createAppointment = useCreateAppointment();
  
  // Get all services and staff
  const { data: allServicesData } = useGetAllServices({ status: 'active' });
  const { data: allStaffData } = useGetAllUsers({ role: 'staff', status: 'active' });

  const allServices = (allServicesData as any)?.services || [];
  const allStaff = (allStaffData as any)?.users || [];

  // State for selections
  const [staffId, setStaffId] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null);
  const [shouldFetchSlots, setShouldFetchSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepare slots query params
  const slotsParams = useMemo(() => {
    if (!staffId || selectedServices.length === 0 || !selectedDate) {
      return null;
    }
    return {
      staffId,
      serviceId: selectedServices.length === 1 ? selectedServices[0] : selectedServices,
      date: selectedDate,
    };
  }, [staffId, selectedServices, selectedDate]);

  // Fetch available slots using TanStack Query
  const { 
    data: slotsData, 
    isLoading: isLoadingSlots, 
    isError: isSlotsError,
    error: slotsError,
  } = useGetSlots(slotsParams, {
    enabled: shouldFetchSlots && !!slotsParams,
  });

  const availableSlots = (slotsData as any)?.slots || [];

  // Handle slots data updates
  useEffect(() => {
    if (!shouldFetchSlots) return;
    
    if (isSlotsError) {
      setInlineMessage({ 
        type: 'error', 
        text: (slotsError as any)?.response?.data?.message || 'Failed to fetch available slots. Please try again.' 
      });
    } else if (!isLoadingSlots && availableSlots.length === 0) {
      setInlineMessage({ type: 'error', text: 'No available slots for the selected date.' });
    } else if (!isLoadingSlots && availableSlots.length > 0) {
      setInlineMessage(null);
    }
  }, [shouldFetchSlots, availableSlots, isLoadingSlots, isSlotsError, slotsError]);

  // Handle staff selection
  const handleStaffChange = (newStaffId: string) => {
    setStaffId(newStaffId);
    setSelectedSlot(null);
    setShouldFetchSlots(false);
    setInlineMessage(null);
  };

  // Handle service selection
  const handleServiceToggle = (serviceId: string) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];

    setSelectedServices(newServices);
    setSelectedSlot(null);
    setShouldFetchSlots(false);
    setInlineMessage(null);
  };

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedSlot(null);
    setShouldFetchSlots(false);
    setInlineMessage(null);
  };

  // Trigger slots fetch
  const handleCheckSlots = () => {
    if (!staffId || selectedServices.length === 0 || !selectedDate) {
      setInlineMessage({ type: 'error', text: 'Please select staff, services, and date before checking slots.' });
      return;
    }
    setShouldFetchSlots(true);
    setInlineMessage(null);
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const canSubmit = useMemo(() => {
    return Boolean(
      staffId &&
      selectedServices.length > 0 &&
      selectedDate &&
      selectedSlot &&
      !isSubmitting
    );
  }, [staffId, selectedServices, selectedDate, selectedSlot, isSubmitting]);

  const canCheckSlots = useMemo(() => {
    return Boolean(staffId && selectedServices.length > 0 && selectedDate && !isLoadingSlots);
  }, [staffId, selectedServices, selectedDate, isLoadingSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedSlot) return;

    setIsSubmitting(true);
    try {
      const result = await createAppointment.mutateAsync({
        staffId,
        services: selectedServices,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: notes.trim() || undefined,
      });
      setInlineMessage({ type: 'success', text: 'Appointment created successfully.' });
      setTimeout(() => navigate(`/appointments/${result._id}`), 1200);
    } catch (error: any) {
      setInlineMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to create appointment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create Appointment</h1>
        <p className="mt-1 text-sm text-gray-500">Schedule a new appointment. Select staff or services first, then choose a date and available time slot.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Staff *</label>
              <select 
                value={staffId} 
                onChange={(e) => handleStaffChange(e.target.value)} 
                className="input-select" 
                required
              >
                <option value="">Select staff member</option>
                {allStaff.map((staff: any) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.firstName} {staff.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Services *</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                {allServices.length === 0 ? (
                  <p className="text-sm text-gray-500">No services available</p>
                ) : (
                  allServices.map((service: any) => (
                    <label key={service._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service._id)}
                        onChange={() => handleServiceToggle(service._id)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {service.name} ({service.duration} min)
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="input"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="label">Available Slots</label>
              <button
                type="button"
                onClick={handleCheckSlots}
                disabled={!canCheckSlots}
                className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingSlots ? 'Checking...' : 'Check Available Slots'}
              </button>
            </div>

            {availableSlots.length > 0 && (
              <div className="md:col-span-2">
                <label className="label">Select Time Slot *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded p-2">
                  {availableSlots.map((slot: ITimeSlot, index: number) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded border text-sm transition-colors ${
                        selectedSlot?.startTime === slot.startTime
                          ? 'bg-blue-500 text-white border-blue-600'
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedSlot && (
              <div className="md:col-span-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium text-blue-900">
                    Selected: {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                  </p>
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                rows={3}
              />
            </div>
          </div>

          {inlineMessage && (
            <div className={`alert-${inlineMessage.type}`}>{inlineMessage.text}</div>
          )}

          <div className="flex gap-3">
            <Link to="/appointments" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={!canSubmit} className="btn-primary">
              {isSubmitting ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentAdd;
