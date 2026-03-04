import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVisibility, MdAdd } from 'react-icons/md';
import { FiSearch, FiFilter, FiList, FiAlertTriangle } from 'react-icons/fi';
import { useGetAllAppointments } from '../../../tanstack/useAppointments';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import Pagination from '../../../components/ui/Pagination';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatAppointmentDateTime, getAppointmentCustomerName, getAppointmentStaffName } from '../../../utils/appointmentUtils';
import { formatCurrency } from '../../../utils/paymentUtils';
import type { IAppointment } from '../../../types/api.types';

/**
 * AppointmentList Component
 * 
 * Displays a paginated table of all appointments with search, filtering, and view actions.
 * Features:
 * - Search by customer name/email with debounce
 * - Filter by status, staff member, and date range
 * - Pagination controls
 * - View action per appointment
 * - Loading skeleton, error, and empty states
 */
const AppointmentList = () => {
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStaffId, setFilterStaffId] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch staff users for filter dropdown
  const { data: staffData } = useGetAllUsers({ role: 'staff', status: 'active' });
  const staffUsers = staffData?.users ?? [];

  /**
   * Debounce search input to reduce API calls
   * Updates debouncedSearch after 500ms of no typing
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      // Reset to page 1 when search changes
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * Build API params from filters, search, and pagination
   * Memoized to prevent unnecessary API calls
   */
  const params = useMemo(() => {
    const apiParams: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add search if provided
    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    // Add status filter if not "all"
    if (filterStatus !== 'all') {
      apiParams.status = filterStatus.toUpperCase();
    }

    // Add staff filter if not "all"
    if (filterStaffId !== 'all') {
      apiParams.staffId = filterStaffId;
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, filterStaffId, currentPage, itemsPerPage]);

  // Fetch appointments with current params
  const { data, isLoading, isError, error } = useGetAllAppointments(params);

  // Extract appointments and pagination from API response
  const appointments = data?.appointments ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalAppointments: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  /**
   * Handle filter changes
   * Resets to page 1 when filters change
   */
  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleStaffFilterChange = (value: string) => {
    setFilterStaffId(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  /**
   * Get error message from API response
   */
  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  return (
    <div className="space-y-6">
      {/* Page header with title and Add Appointment button */}
      <header className="">
        {/* title and description */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage appointments and schedules
          </p>
        </div>

        {/* search Bar and Add button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search input */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search appointments by customer..."
                className="input-search"
              />
            </div>
          </div>

          {/* Add appointment button */}
          <Link to="/appointments/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span>Add Appointment</span>
            <MdAdd size={24} />
          </Link>
        </div>

        {/* appointment count & filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* appointment count */}
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalAppointments} appointments</p>
          </div>

          {/* filters */}
          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            {/* Staff filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterStaffId}
                onChange={(e) => handleStaffFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Staff</option>
                {staffUsers.map((staff: any) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.firstName} {staff.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Items per page */}
            <div className="relative">
              <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Appointments table */}
      <div className="table-container">
        <table className="table">
          {/* Table header */}
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Customer</th>
              <th className="table-header-cell">Staff</th>
              <th className="table-header-cell">Date/Time</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Amount</th>
              <th className="table-header-cell-right">Actions</th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="table-body">
            {/* Loading state: skeleton rows */}
            {isLoading && (
              <>
                {[...Array(5)].map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="table-cell">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-36 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end">
                        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-300" />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="table-cell-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FiAlertTriangle className="text-brand-accent" size={48} />
                    <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center">
                  <p className="text-gray-500">No appointments found.</p>
                  {debouncedSearch || filterStatus !== 'all' || filterStaffId !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search or filters.
                    </p>
                  ) : null}
                </td>
              </tr>
            )}

            {/* Appointment rows */}
            {!isLoading &&
              !isError &&
              appointments.map((appointment: IAppointment) => {
                const totalAmount = (appointment.bookingFeeAmount || 0) + (appointment.remainingAmount || 0);

                return (
                  <tr key={appointment._id} className="table-row">
                    {/* Customer */}
                    <td className="table-cell">
                      <div className="font-medium text-gray-900 whitespace-nowrap">
                        {getAppointmentCustomerName(appointment)}
                      </div>
                    </td>

                    {/* Staff */}
                    <td className="table-cell-text">
                      {getAppointmentStaffName(appointment)}
                    </td>

                    {/* Date/Time */}
                    <td className="table-cell-text">
                      {formatAppointmentDateTime(appointment.startTime)}
                    </td>

                    {/* Status */}
                    <td className="table-cell">
                      <StatusBadge status={appointment.status} type="appointment-status" />
                    </td>

                    {/* Amount */}
                    <td className="table-cell-text">
                      {formatCurrency(totalAmount, 'KES')}
                    </td>

                    {/* Actions */}
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/appointments/${appointment._id}`}
                          className="flex items-center justify-center rounded-lg bg-white p-2 text-blue-600 transition hover:bg-blue-50"
                          title="View appointment"
                        >
                          <MdVisibility className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination - separate from table container */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalAppointments}
            currentPageCount={appointments.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
