import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVisibility, MdAdd } from 'react-icons/md';
import { useGetAllAppointments } from '../../../tanstack/useAppointments';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import Pagination from '../../../components/ui/Pagination';
import { formatAppointmentDateTime, formatAppointmentStatus, getAppointmentStatusVariant, getAppointmentCustomerName, getAppointmentStaffName, getAppointmentServicesDisplay } from '../../../utils/appointmentUtils';
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch staff users for filter dropdown
  const { data: staffData } = useGetAllUsers({ role: 'staff', status: 'active' });
  const staffUsers = (staffData as any)?.users || [];

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
  const appointments = (data as any)?.appointments || (data as any)?.data?.appointments || [];
  const pagination = (data as any)?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
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
  const errorMessage =
    (error as any)?.response?.data?.message || 'Failed to load appointments.';

  return (
    <div className="space-y-6">
      {/* Page header with title and Add Appointment button */}
      <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage appointments and schedules
          </p>
        </div>
        <Link to="/appointments/new" className="btn-primary flex items-center gap-2">
          <span>Add Appointment</span>
          <MdAdd size={24} />
        </Link>
      </div>

      {/* Filters and search toolbar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-y-4">
          {/* Search input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search appointments by customer..."
              className="input-search"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-row gap-2 flex-wrap items-center">
            {/* Status filter */}
            <div className="flex-1 min-w-[150px]">
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="input-select w-full"
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
            <div className="flex-1 min-w-[150px]">
              <select
                value={filterStaffId}
                onChange={(e) => handleStaffFilterChange(e.target.value)}
                className="input-select w-full"
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
            <div>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="input-select w-full"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments table */}
      <div className="table-container">
        <table className="table">
          {/* Table header */}
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Customer</th>
              <th className="table-header-cell">Staff</th>
              <th className="table-header-cell">Services</th>
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
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-300" />
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
                    <td className="table-cell" />
                  </tr>
                ))}
              </>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <tr>
                <td colSpan={7} className="table-cell-center">
                  <div className="alert-error mx-auto max-w-md">{errorMessage}</div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && appointments.length === 0 && (
              <tr>
                <td colSpan={7} className="table-cell-center">
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
                const statusVariant = getAppointmentStatusVariant(appointment.status);
                const totalAmount = (appointment.bookingFeeAmount || 0) + (appointment.remainingAmount || 0);

                return (
                  <tr key={appointment._id} className="table-row">
                    {/* Customer */}
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">
                        {getAppointmentCustomerName(appointment)}
                      </div>
                    </td>

                    {/* Staff */}
                    <td className="table-cell-text">
                      {getAppointmentStaffName(appointment)}
                    </td>

                    {/* Services */}
                    <td className="table-cell-text">
                      {getAppointmentServicesDisplay(appointment)}
                    </td>

                    {/* Date/Time */}
                    <td className="table-cell-text">
                      {formatAppointmentDateTime(appointment.startTime)}
                    </td>

                    {/* Status */}
                    <td className="table-cell">
                      <span className={`badge badge-${statusVariant}`}>
                        {formatAppointmentStatus(appointment.status)}
                      </span>
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
                          className="btn-ghost btn-sm flex items-center gap-1"
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

        {/* Pagination */}
        {!isLoading && !isError && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentList;
