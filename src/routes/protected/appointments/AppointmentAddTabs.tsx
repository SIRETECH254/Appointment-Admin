import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateAppointment } from '../../../tanstack/useAppointments';
import { useGetAllServices } from '../../../tanstack/useServices';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import { useGetSlots } from '../../../tanstack/useAvailability';
import type { ITimeSlot } from '../../../types/api.types';
import { APPOINTMENT_TABS } from '../../../constants/appointmentTabs';
import StaffSelectionTab from './steps/StaffSelectionTab';
import ServiceSelectionTab from './steps/ServiceSelectionTab';
import DateSlotSelectionTab from './steps/DateSlotSelectionTab';
import NotesTab from './steps/NotesTab';
import SummaryTab from './steps/SummaryTab';












const AppointmentAddTabs = () => {
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

  // Tab management
  const [activeTabId, setActiveTabId] = useState(APPOINTMENT_TABS[0].id);
  const activeTabIndex = useMemo(() => APPOINTMENT_TABS.findIndex(tab => tab.id === activeTabId), [activeTabId]);

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

    // Auto-select services provided by the newly selected staff
    const selectedStaffMember = allStaff.find((staff: any) => staff._id === newStaffId);
    if (selectedStaffMember && selectedStaffMember.services) {
      const staffServiceIds = selectedStaffMember.services.map((service: any) => service._id);
      setSelectedServices(staffServiceIds);
    } else {
      setSelectedServices([]);
    }
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

  // Navigation handlers
  const goToNextTab = () => {
    if (activeTabIndex < APPOINTMENT_TABS.length - 1) {
      setActiveTabId(APPOINTMENT_TABS[activeTabIndex + 1].id);
    }
  };

  const goToPreviousTab = () => {
    if (activeTabIndex > 0) {
      setActiveTabId(APPOINTMENT_TABS[activeTabIndex - 1].id);
    }
  };

  const handleEditTab = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const renderTabContent = () => {
    switch (activeTabId) {
      case 'staff-selection':
        return (
          <StaffSelectionTab
            staff={allStaff}
            selectedStaffId={staffId}
            onStaffChange={handleStaffChange}
            selectedDate={selectedDate}
          />
        );
      case 'service-selection':
        return (
          <ServiceSelectionTab
            allServices={allServices}
            selectedServices={selectedServices}
            onServiceToggle={handleServiceToggle}
            staffId={staffId} // Pass staffId for validation
            allStaff={allStaff} // Pass allStaff for service validation
          />
        );
      case 'date-slot-selection':
        return (
          <DateSlotSelectionTab
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            handleCheckSlots={handleCheckSlots}
            availableSlots={availableSlots}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            isLoadingSlots={isLoadingSlots}
            inlineMessage={inlineMessage}
            canCheckSlots={canCheckSlots}
          />
        );
      case 'notes':
        return (
          <NotesTab
            notes={notes}
            onNotesChange={setNotes}
          />
        );
      case 'summary':
        return (
          <SummaryTab
            staff={allStaff}
            allServices={allServices}
            selectedStaffId={staffId}
            selectedServices={selectedServices}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            notes={notes}
            onEditTab={handleEditTab}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create Appointment</h1>
        <p className="mt-1 text-sm text-gray-500">Schedule a new appointment. Select staff or services first, then choose a date and available time slot.</p>
      </div>

      {/* Tab Header and Progress Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm font-medium text-gray-500">
            {APPOINTMENT_TABS.map((tab, index) => (
              <React.Fragment key={tab.id}>
                <div className={`flex flex-col items-center relative ${index <= activeTabIndex ? 'text-brand-primary' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 
                                  ${index < activeTabIndex ? 'bg-brand-primary text-white' : ''}
                                  ${index === activeTabIndex ? 'bg-brand-primary/20 text-brand-primary font-bold' : 'border-2 border-gray-300'}`}>
                    {index < activeTabIndex ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="mt-2 text-center text-xs w-20">{tab.name}</span>
                </div>
                {index < APPOINTMENT_TABS.length - 1 && (
                  <div className={`flex-auto border-t-2 transition-colors duration-200 
                                  ${index < activeTabIndex ? 'border-brand-primary' : 'border-gray-300'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">{APPOINTMENT_TABS[activeTabIndex].name}</h2>
        
        {/* Tab Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div> {/* This div wraps the tab content */}
            {renderTabContent()}
          </div>

          {inlineMessage && (
            <div className={`alert-${inlineMessage.type}`}>{inlineMessage.text}</div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {activeTabIndex > 0 && (
              <button type="button" onClick={goToPreviousTab} className="btn-secondary">
                Previous
              </button>
            )}
            {activeTabIndex < APPOINTMENT_TABS.length - 1 && (
              <button type="button" onClick={goToNextTab} className="btn-primary">
                Next
              </button>
            )}
            {activeTabId === 'summary' && (
              <button type="submit" disabled={!canSubmit} className="btn-primary">
                {isSubmitting ? 'Creating...' : 'Create Appointment'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentAddTabs;
