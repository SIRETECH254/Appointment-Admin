import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  HiCheck, 
  HiCheckCircle, 
  HiCalendar, 
  HiClock, 
  HiUser, 
  HiOutlineUser, 
  HiPencil, 
  HiCurrencyDollar,
  HiBriefcase,
  HiClipboardList
} from 'react-icons/hi';
import { FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { useAdminCreateAppointment } from '../../../tanstack/useAppointments';
import { useGetAllServices } from '../../../tanstack/useServices';
import { useGetAllUsers, useGetCustomers } from '../../../tanstack/useUsers';
import { useGetSlots } from '../../../tanstack/useAvailability';
import Pagination from '../../../components/ui/Pagination';
import { formatCurrency } from '../../../utils/paymentUtils';
import type { IUser, ITimeSlot } from '../../../types/api.types';

// Define the tabs for the booking flow
type BookingTab = 'customer' | 'staff' | 'services' | 'slots' | 'summary';

const TABS: { key: BookingTab; label: string; step: number }[] = [
  { key: 'customer', label: 'Customer', step: 1 },
  { key: 'staff', label: 'Staff', step: 2 },
  { key: 'services', label: 'Services', step: 3 },
  { key: 'slots', label: 'Slots', step: 4 },
  { key: 'summary', label: 'Summary', step: 5 },
];

/**
 * Appointment Create Screen
 * Implements a tabbed interface for booking an appointment.
 * Tabs: Select Staff -> Select Services -> Slot Availability -> Summary
 */
const AppointmentAddTabs = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BookingTab>('customer');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Selection State
  const [selectedCustomer, setSelectedCustomer] = useState<IUser | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('');
  const [customerPage, setCustomerPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<IUser | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [shouldFetchSlots, setShouldFetchSlots] = useState(false);

  // Debounce customer search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCustomerSearch(customerSearchTerm);
      setCustomerPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [customerSearchTerm]);

  // Customer Query Params
  const customerParams = useMemo(() => {
    const params: any = {
      page: customerPage,
      limit: 5,
    };
    if (debouncedCustomerSearch.trim()) {
      params.search = debouncedCustomerSearch.trim();
    }
    return params;
  }, [debouncedCustomerSearch, customerPage]);

  // Queries
  const { data: customerData, isLoading: isLoadingCustomers, isError: isErrorCustomers, error: customerError } = useGetCustomers(customerParams);
  
  const customers = customerData?.customers ?? customerData?.users ?? [];

  const customerPagination = customerData?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    totalCustomers: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const totalCustomerItems = customerPagination.totalCustomers ?? customerPagination.totalUsers ?? 0;

  const { data: allStaffData, isLoading: isLoadingStaff } = useGetAllUsers({ role: 'staff', status: 'active' });
  const allStaff = allStaffData?.users ?? [];

  const { data: allServicesData, isLoading: isLoadingServices } = useGetAllServices({ status: 'active' });
  const allServices = allServicesData?.services ?? [];

  // Slots Query - only runs when manually triggered via button
  const slotsParams = useMemo(() => {
    if (!selectedStaff?._id || selectedServices.length === 0 || !selectedDate) return null;
    return {
      staffId: selectedStaff._id,
      serviceId: selectedServices.length === 1 ? selectedServices[0] : selectedServices,
      date: format(selectedDate, 'yyyy-MM-dd'),
    };
  }, [selectedStaff, selectedServices, selectedDate]);

  const { data: slotsData, isLoading: isLoadingSlots, refetch: refetchSlots } = useGetSlots(slotsParams, {
    enabled: shouldFetchSlots && !!slotsParams,
  });
  const slots = slotsData?.slots ?? [];

  // Mutation
  const createMutation = useAdminCreateAppointment();

  // Get current step number
  const currentStep = useMemo(() => {
    return TABS.find(tab => tab.key === activeTab)?.step || 1;
  }, [activeTab]);

  /**
   * Validate current tab and return error message if invalid
   */
  const validateCurrentTab = useCallback((): string | null => {
    if (activeTab === 'customer' && !selectedCustomer) {
      return 'Please select a customer.';
    }

    if (activeTab === 'staff' && !selectedStaff) {
      return 'Please select a staff member.';
    }
    
    if (activeTab === 'services' && selectedServices.length === 0) {
      return 'Please select at least one service.';
    }
    
    if (activeTab === 'slots') {
      if (!selectedDate) {
        return 'Please select a date.';
      }
      if (!shouldFetchSlots) {
        return 'Please click "Check Availability" to see available slots.';
      }
      if (!selectedSlot) {
        return 'Please select a time slot.';
      }
    }
    
    if (activeTab === 'summary') {
      if (!selectedStaff) {
        return 'Please select a staff member.';
      }
      if (selectedServices.length === 0) {
        return 'Please select at least one service.';
      }
      if (!selectedSlot) {
        return 'Please select a time slot.';
      }
    }
    
    return null;
  }, [activeTab, selectedCustomer, selectedStaff, selectedServices, selectedDate, shouldFetchSlots, selectedSlot]);

  /**
   * Validate tab navigation (for step indicator clicks - doesn't show errors)
   */
  const validateTabNavigation = useCallback((targetTab: BookingTab): boolean => {
    // Don't set error messages here - only prevent navigation
    // Errors should only show when clicking "Next" button
    
    if (targetTab === 'staff' && !selectedCustomer) {
      return false;
    }

    if (targetTab === 'services' && (!selectedCustomer || !selectedStaff)) {
      return false;
    }
    
    if (targetTab === 'slots' && (!selectedCustomer || !selectedStaff || selectedServices.length === 0)) {
      return false;
    }
    
    if (targetTab === 'summary' && (!selectedCustomer || !selectedStaff || selectedServices.length === 0 || !selectedSlot)) {
      return false;
    }
    
    return true;
  }, [selectedCustomer, selectedStaff, selectedServices, selectedSlot]);

  /**
   * Handle tab change with validation (for step indicator clicks)
   */
  const handleTabChange = useCallback((tab: BookingTab) => {
    // Only allow navigation if validation passes
    // Don't show errors here - errors only show when clicking "Next"
    if (!validateTabNavigation(tab)) {
      return;
    }
    setActiveTab(tab);
    setErrorMessage(''); // Clear any existing errors when navigating
  }, [validateTabNavigation]);

  /**
   * Clear error when selection is made on current tab
   */
  useEffect(() => {
    // Only clear error if there's an error message and a valid selection is made
    if (errorMessage) {
      if (activeTab === 'customer' && selectedCustomer) {
        setErrorMessage('');
      } else if (activeTab === 'staff' && selectedStaff) {
        setErrorMessage('');
      } else if (activeTab === 'services' && selectedServices.length > 0) {
        setErrorMessage('');
      } else if (activeTab === 'slots' && selectedSlot) {
        setErrorMessage('');
      }
    }
  }, [activeTab, selectedCustomer, selectedStaff, selectedServices, selectedSlot, errorMessage]);

  /**
   * Tab 1: Handle Customer Selection
   */
  const handleCustomerSelect = useCallback((customer: IUser) => {
    setSelectedCustomer(customer);
    setErrorMessage('');
  }, []);

  /**
   * Tab 2: Handle Staff Selection
   * Automatically selects all services offered by the selected staff.
   */
  const handleStaffSelect = useCallback((staff: IUser) => {
    setSelectedStaff(staff);
    // Autoselect services provided by this staff
    const staffServices = (staff as any).services || [];
    const staffServiceIds = staffServices.map((s: any) => typeof s === 'string' ? s : s._id);
    setSelectedServices(staffServiceIds);
    setSelectedSlot(null); // Reset slot if staff changes
    setSelectedDate(null); // Reset date
    setShouldFetchSlots(false); // Reset fetch flag
    // Don't automatically navigate - user must click "Next"
    setErrorMessage('');
  }, []);

  /**
   * Tab 2: Handle Service Toggle
   */
  const toggleService = useCallback((serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
    setSelectedSlot(null); // Reset slot if services change
    setSelectedDate(null); // Reset date
    setShouldFetchSlots(false); // Reset fetch flag
  }, []);

  /**
   * Check if a service is disabled (if it's not offered by the selected staff)
   */
  const isServiceDisabled = useCallback((serviceId: string) => {
    if (!selectedStaff) return false;
    const staffServices = (selectedStaff as any).services || [];
    const staffServiceIds = staffServices.map((s: any) => typeof s === 'string' ? s : s._id);
    return !staffServiceIds.includes(serviceId);
  }, [selectedStaff]);

  /**
   * Calculate total duration and price
   */
  const totals = useMemo(() => {
    return selectedServices.reduce((acc, id) => {
      const service = allServices.find(s => s._id === id);
      return {
        price: acc.price + (service?.fullPrice || 0),
        duration: acc.duration + (service?.duration || 0)
      };
    }, { price: 0, duration: 0 });
  }, [selectedServices, allServices]);

  /**
   * Tab 3: Handle Date Selection
   */
  const handleDateChange = useCallback((dateString: string) => {
    const date = new Date(dateString);
    setSelectedDate(date);
    setSelectedSlot(null);
    setShouldFetchSlots(false); // Reset fetch flag when date changes
  }, []);

  /**
   * Handle Check Availability button click
   */
  const handleCheckAvailability = useCallback(() => {
    if (!selectedDate) {
      setErrorMessage('Please select a date first.');
      return;
    }
    setShouldFetchSlots(true);
    setSelectedSlot(null); // Reset selected slot
    refetchSlots();
  }, [selectedDate, refetchSlots]);

  /**
   * Final Submission
   */
  const handleBooking = async () => {
    if (!selectedCustomer || !selectedStaff || selectedServices.length === 0 || !selectedSlot) {
      setErrorMessage('Please complete all steps before booking.');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        userId: selectedCustomer._id,
        staffId: selectedStaff._id,
        services: selectedServices,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: notes.trim() || undefined,
      });
      
      const appointmentId = (result as any)?.data?.appointment?._id;
      if (appointmentId) {
        navigate(`/appointments/${appointmentId}`);
      } else {
        navigate('/appointments');
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to create appointment.');
    }
  };

  /**
   * Render Step Indicator Header
   */
  const renderStepHeader = () => {
    const progress = (currentStep / TABS.length) * 100;
    
    return (
      <div className="bg-white border-b border-gray-100 space-y-4 p-3">
        <div className="flex-row items-center justify-between flex">
          {/* current step & label */}
          <div className="flex-row items-center gap-x-2 flex">
            <div className="h-5 w-5 rounded-full items-center justify-center bg-brand-primary text-white text-xs font-bold flex">
              {TABS.find(tab => tab.key === activeTab)?.step}
            </div>
            <span className="text-sm font-semibold text-brand-primary">
              {TABS.find(tab => tab.key === activeTab)?.label}
            </span>
          </div>
       
          {/* Step numbers and labels */}
          <div className="flex-row items-center gap-x-2 md:gap-x-4 lg:gap-x-6 flex">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              const isCompleted = currentStep > tab.step;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className="flex-1 items-center flex flex-col"
                  disabled={!validateTabNavigation(tab.key)}
                  type="button"
                >
                  <div className="items-center flex flex-col">
                    {/* Step number circle */}
                    <div className={`h-6 w-6 rounded-full items-center justify-center flex ${
                      isActive 
                        ? 'bg-brand-primary' 
                        : isCompleted 
                          ? 'bg-brand-primary/30' 
                          : 'bg-gray-200'
                    }`}>
                      {isCompleted ? (
                        <HiCheck className="w-5 h-5 text-white" />
                      ) : (
                        <span className={`text-base font-bold ${
                          isActive ? 'text-white' : 'text-gray-500'
                        }`}>
                          {tab.step}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full">
          <div 
            className="h-full bg-brand-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  /**
   * Render Staff Card Skeleton
   */
  const renderStaffSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="mb-4 flex-row items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse flex"
      >
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="ml-4 flex-1">
          <div className="h-5 w-32 rounded bg-gray-200 mb-2" />
          <div className="h-4 w-24 rounded bg-gray-200 mb-2" />
          <div className="h-3 w-48 rounded bg-gray-200" />
        </div>
      </div>
    ));
  };

  /**
   * Render Service Card Skeleton
   */
  const renderServiceSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="mb-3 flex-row items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse flex"
      >
        <div className="flex-1">
          <div className="h-5 w-40 rounded bg-gray-200 mb-2" />
          <div className="h-4 w-32 rounded bg-gray-200" />
        </div>
        <div className="h-6 w-6 rounded bg-gray-200" />
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create Appointment</h1>
        <p className="mt-1 text-sm text-gray-500">Schedule a new appointment. Select staff or services first, then choose a date and available time slot.</p>
      </div>

      {/* Header with Step Indicator and Progress Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {renderStepHeader()}

        {/* Step indicator in header right */}
        <div className="p-4 border-b border-gray-100 flex justify-end">
          <span className="text-sm font-semibold text-brand-primary">
            Step {currentStep} of {TABS.length}
          </span>
        </div>

        <div className="p-6">
          {/* Tab 1: Customer Selection */}
          {activeTab === 'customer' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Customer</h2>
              
              <div className="mb-6">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                  <input
                    type="text"
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    placeholder="Search by name, email or phone..."
                    className="input-search"
                    autoFocus
                  />
                </div>
              </div>

              {isLoadingCustomers ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="w-full flex-row items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse flex"
                    >
                      <div className="h-12 w-12 rounded-full bg-gray-200" />
                      <div className="ml-4 flex-1">
                        <div className="h-5 w-32 rounded bg-gray-200 mb-2" />
                        <div className="h-4 w-48 rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isErrorCustomers ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <FiAlertTriangle className="text-brand-accent" size={48} />
                  <p className="text-sm font-medium text-gray-700">
                    {(customerError as any)?.response?.data?.message || 'Failed to fetch customers'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customers.length > 0 ? (
                    <>
                      {customers.map((customer) => (
                        <button
                          key={customer._id}
                          onClick={() => handleCustomerSelect(customer)}
                          type="button"
                          className={`w-full flex-row items-center p-4 rounded-2xl bg-white border ${
                            selectedCustomer?._id === customer._id 
                              ? 'border-brand-primary ring-2 ring-brand-primary' 
                              : 'border-gray-100 hover:border-gray-200'
                          } shadow-sm transition-all hover:shadow-md flex text-left`}
                        >
                          <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden items-center justify-center flex flex-shrink-0">
                            {customer.avatar ? (
                              <img src={customer.avatar} alt={`${customer.firstName} ${customer.lastName}`} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-gray-500 font-medium text-lg">
                                {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="text-base font-bold text-gray-900">{customer.firstName} {customer.lastName}</p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                            {customer.phone && <p className="text-xs text-gray-400 mt-0.5">{customer.phone}</p>}
                          </div>
                          {selectedCustomer?._id === customer._id && (
                            <div className="ml-4">
                              <div className="h-6 w-6 rounded-full bg-brand-primary flex items-center justify-center">
                                <HiCheck className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}

                      {/* Pagination for customer selection */}
                      {customerPagination.totalPages > 1 && (
                        <div className="mt-4">
                          <Pagination
                            currentPage={customerPagination.currentPage}
                            totalPages={customerPagination.totalPages}
                            totalItems={totalCustomerItems}
                            currentPageCount={customers.length}
                            onPageChange={setCustomerPage}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    debouncedCustomerSearch && (
                      <div className="text-center py-8 text-gray-500">
                        No customers found matching "{debouncedCustomerSearch}"
                      </div>
                    )
                  )}
                  {!debouncedCustomerSearch && customers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Start typing to search for a customer
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Staff Selection */}
          {activeTab === 'staff' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Professional</h2>
              {isLoadingStaff ? (
                <div>{renderStaffSkeleton()}</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-x-4">
                  {allStaff.map((staff) => {
                    const staffServices = ((staff as any).services || []).map((s: any) => 
                      typeof s === 'string' ? s : s.name || s
                    );
                    
                    return (
                      <button
                        key={staff._id}
                        onClick={() => handleStaffSelect(staff)}
                        type="button"
                        className={`mb-4 flex-row items-center p-4 rounded-2xl bg-white border ${
                          selectedStaff?._id === staff._id ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-gray-100'
                        } shadow-sm transition-all hover:shadow-md flex`}
                      >
                        <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden items-center justify-center flex">
                          {staff.avatar ? (
                            <img src={staff.avatar} alt={`${staff.firstName} ${staff.lastName}`} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-gray-500 font-medium">
                              {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="ml-4 flex-1 text-left">
                          <p className="text-lg font-bold text-gray-900">{staff.firstName} {staff.lastName}</p>
                          {staff.roles && staff.roles.length > 0 && (
                            <p className="text-sm text-gray-500">{staff.roles[0]?.displayName || staff.roles[0]?.name}</p>
                          )}
                          
                          {/* Services list */}
                          {staffServices.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Services Provided:</p>
                              <div className="ml-2">
                                {staffServices.slice(0, 3).map((serviceName: string, idx: number) => (
                                  <div key={idx} className="flex-row items-center mb-1 flex">
                                    <span className="text-xs text-gray-500">• {serviceName}</span>
                                  </div>
                                ))}
                                {staffServices.length > 3 && (
                                  <span className="text-xs text-gray-500">+{staffServices.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedStaff?._id === staff._id && (
                          <HiCheckCircle className="w-6 h-6 text-brand-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Service Selection */}
          {activeTab === 'services' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Services</h2>
              {isLoadingServices ? (
                <div>{renderServiceSkeleton()}</div>
              ) : (
                <>
                  <div className="space-y-3">
                    {allServices.map((service) => {
                      const isDisabled = isServiceDisabled(service._id);
                      const isSelected = selectedServices.includes(service._id);
                      
                      return (
                        <button
                          key={service._id}
                          onClick={() => !isDisabled && toggleService(service._id)}
                          disabled={isDisabled}
                          type="button"
                          className={`mb-3 flex-row items-center p-4 rounded-2xl bg-white border ${
                            isSelected ? 'border-brand-primary' : 'border-gray-100'
                          } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-md'} shadow-sm transition-all w-full flex`}
                        >
                          <div className="flex-1 text-left">
                            <p className="text-base font-bold text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.duration} mins • {formatCurrency(service.fullPrice)}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            disabled={isDisabled}
                            className="w-6 h-6 rounded text-brand-primary focus:ring-brand-primary"
                          />
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/20">
                    <div className="flex-row justify-between mb-1 flex">
                      <span className="text-gray-600">Total Duration:</span>
                      <span className="font-bold text-gray-900">{totals.duration} mins</span>
                    </div>
                    <div className="flex-row justify-between flex">
                      <span className="text-gray-600">Estimated Price:</span>
                      <span className="font-bold text-brand-primary text-lg">{formatCurrency(totals.price)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 3: Slots Availability */}
          {activeTab === 'slots' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
              
              <div className="mt-4">
                <label className="label">Date *</label>
                <input
                  type="date"
                  value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="input"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              {/* Check Availability Button */}
              <button
                onClick={handleCheckAvailability}
                disabled={!selectedDate || isLoadingSlots}
                type="button"
                className={`mt-4 p-4 rounded-2xl shadow-sm w-full ${
                  selectedDate && !isLoadingSlots
                    ? 'bg-brand-primary/10 hover:bg-brand-primary/20' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <span className={`text-center font-bold ${
                  selectedDate && !isLoadingSlots ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {isLoadingSlots ? 'Checking...' : 'Check Availability'}
                </span>
              </button>

              {/* Slots Display */}
              {shouldFetchSlots && (
                <div className="mt-8">
                  <p className="text-base font-bold text-gray-700 mb-4">
                    Available Slots for {selectedStaff?.firstName}
                  </p>
                  
                  {isLoadingSlots ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    </div>
                  ) : (
                    <>
                      {/* Show message if available (even if slots array is empty) */}
                      {(slotsData as any)?.message && (
                        <div className="mb-4 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-xl">
                          <p className="text-sm text-brand-primary font-medium text-center">
                            {(slotsData as any).message}
                          </p>
                        </div>
                      )}

                      {/* Show slots if available */}
                      {slots.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {slots.map((slot, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedSlot(slot)}
                              type="button"
                              className={`px-4 py-3 rounded-xl border ${
                                selectedSlot?.startTime === slot.startTime 
                                  ? 'bg-brand-primary/10 border-brand-primary' 
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <span className={`font-bold ${
                                selectedSlot?.startTime === slot.startTime ? 'text-gray-800' : 'text-gray-700'
                              }`}>
                                {format(new Date(slot.startTime), 'p')}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        /* Show empty state only if no message was provided */
                        !(slotsData as any)?.message && (
                          <div className="items-center py-10 flex flex-col">
                            <HiCalendar className="w-12 h-12 text-gray-400" />
                            <p className="mt-2 text-gray-400">No available slots for this date</p>
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Summary */}
          {activeTab === 'summary' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Review Appointment</h2>
              
              {/* Customer Card */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
                <div className="flex-row items-center justify-between mb-3 flex">
                  <div className="flex-row items-center flex">
                    <HiOutlineUser className="w-5 h-5 text-brand-primary" />
                    <span className="text-base font-bold text-gray-900 ml-2">Customer</span>
                  </div>
                  <button
                    onClick={() => handleTabChange('customer')}
                    type="button"
                    className="p-2"
                  >
                    <HiPencil className="w-5 h-5 text-brand-primary" />
                  </button>
                </div>
                <div className="flex-row items-center flex">
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden items-center justify-center flex">
                    {selectedCustomer?.avatar ? (
                      <img src={selectedCustomer.avatar} alt={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-500 font-medium">
                        {selectedCustomer?.firstName?.charAt(0)}{selectedCustomer?.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-base font-bold text-gray-900">
                      {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedCustomer?.email}</p>
                  </div>
                </div>
              </div>

              {/* Staff Card */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
                <div className="flex-row items-center justify-between mb-3 flex">
                  <div className="flex-row items-center flex">
                    <HiUser className="w-5 h-5 text-brand-primary" />
                    <span className="text-base font-bold text-gray-900 ml-2">Staff</span>
                  </div>
                  <button
                    onClick={() => handleTabChange('staff')}
                    type="button"
                    className="p-2"
                  >
                    <HiPencil className="w-5 h-5 text-brand-primary" />
                  </button>
                </div>
                <div className="flex-row items-center flex">
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden items-center justify-center flex">
                    {selectedStaff?.avatar ? (
                      <img src={selectedStaff.avatar} alt={`${selectedStaff.firstName} ${selectedStaff.lastName}`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-500 font-medium">
                        {selectedStaff?.firstName?.charAt(0)}{selectedStaff?.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-base font-bold text-gray-900">
                      {selectedStaff?.firstName} {selectedStaff?.lastName}
                    </p>
                    <div className="flex-row items-center mt-1 flex">
                      <HiBriefcase className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-1">
                        {selectedStaff?.roles?.[0]?.displayName || selectedStaff?.roles?.[0]?.name || 'Staff'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Card */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
                <div className="flex-row items-center justify-between mb-3 flex">
                  <div className="flex-row items-center flex">
                    <HiClipboardList className="w-5 h-5 text-brand-primary" />
                    <span className="text-base font-bold text-gray-900 ml-2">Services</span>
                  </div>
                  <button
                    onClick={() => handleTabChange('services')}
                    type="button"
                    className="p-2"
                  >
                    <HiPencil className="w-5 h-5 text-brand-primary" />
                  </button>
                </div>
                <div className="flex-1">
                  {allServices
                    .filter(s => selectedServices.includes(s._id))
                    .map((service, index) => (
                      <div key={service._id} className="flex-row items-center mb-2 flex">
                        <HiCheckCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 ml-2 flex-1">
                          {index + 1}. {service.name} - {formatCurrency(service.fullPrice)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Date & Time Card */}
              {selectedDate && selectedSlot && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
                  <div className="flex-row items-center justify-between mb-3 flex">
                    <div className="flex-row items-center flex">
                      <HiClock className="w-5 h-5 text-brand-primary" />
                      <span className="text-base font-bold text-gray-900 ml-2">Date & Time</span>
                    </div>
                    <button
                      onClick={() => handleTabChange('slots')}
                      type="button"
                      className="p-2"
                    >
                      <HiPencil className="w-5 h-5 text-brand-primary" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="flex-row items-center mb-2 flex">
                      <HiCalendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 ml-2">
                        Date: {format(selectedDate, 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex-row items-center mb-2 flex">
                      <HiClock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 ml-2">
                        Start: {format(new Date(selectedSlot.startTime), 'p')}
                      </span>
                    </div>
                    <div className="flex-row items-center flex">
                      <HiClock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 ml-2">
                        End: {format(new Date(selectedSlot.endTime), 'p')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Summary Card */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
                <div className="flex-row items-center mb-3 flex">
                  <HiCurrencyDollar className="w-5 h-5 text-brand-primary" />
                  <span className="text-base font-bold text-gray-900 ml-2">Price Summary</span>
                </div>
                <div className="flex-row items-center justify-between mb-2 flex">
                  <div className="flex-row items-center flex">
                    <HiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 ml-2">Total Duration:</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{totals.duration} mins</span>
                </div>
                <div className="flex-row items-center justify-between flex">
                  <div className="flex-row items-center flex">
                    <HiCurrencyDollar className="w-4 h-4 text-gray-400" />
                    <span className="text-base font-bold text-gray-900 ml-2">Total Price:</span>
                  </div>
                  <span className="text-base font-bold text-brand-primary">{formatCurrency(totals.price)}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="label">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything else we should know?"
                  className="input min-h-[100px] pt-3"
                  rows={4}
                />
              </div>

              {createMutation.isError && (
                <div className="alert-error mb-4">
                  <span className="text-red-700">Error: {(createMutation.error as any)?.response?.data?.message || 'Failed to create appointment.'}</span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex-row gap-4 flex">
          {activeTab !== 'customer' && (
            <button
              onClick={() => {
                // Clear error when going back to previous tab
                setErrorMessage('');
                
                // Navigate to previous tab
                if (activeTab === 'staff') {
                  setActiveTab('customer');
                } else if (activeTab === 'services') {
                  setActiveTab('staff');
                } else if (activeTab === 'slots') {
                  setActiveTab('services');
                } else if (activeTab === 'summary') {
                  setActiveTab('slots');
                }
              }}
              type="button"
              className="btn-secondary flex-1"
            >
              <span className="font-bold text-gray-700">Previous</span>
            </button>
          )}
          
          <button
            onClick={() => {
              // Validate current tab and show specific error
              const error = validateCurrentTab();
              if (error) {
                setErrorMessage(error);
                return;
              }
              
              // Clear error if validation passes
              setErrorMessage('');
              
              // Proceed to next tab
              if (activeTab === 'customer') {
                setActiveTab('staff');
              } else if (activeTab === 'staff') {
                setActiveTab('services');
              } else if (activeTab === 'services') {
                setActiveTab('slots');
              } else if (activeTab === 'slots') {
                setActiveTab('summary');
              } else if (activeTab === 'summary') {
                handleBooking();
              }
            }}
            disabled={createMutation.isPending}
            type="button"
            className="btn-primary flex-1"
          >
            {createMutation.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            ) : (
              <span className="font-bold text-white">
                {activeTab === 'summary' ? 'Book' : 'Next'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentAddTabs;
