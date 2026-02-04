import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVisibility, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useGetAllBreaks, useDeleteBreak } from '../../../tanstack/useBreaks';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { formatBreakDateTime, getStaffName, getStaffInitials } from '../../../utils/breakUtils';
import type { IBreak, IUser } from '../../../types/api.types';

/**
 * BreakList Component
 * 
 * Displays a paginated table of all breaks with search, filtering, and CRUD actions.
 * Features:
 * - Search by staff name/reason with debounce
 * - Filter by staff and date range
 * - Pagination controls
 * - View, Edit, Delete actions per break
 * - Loading skeleton, error, and empty states
 */
const BreakList = () => {

  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterStaff, setFilterStaff] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [breakToDelete, setBreakToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // TanStack Query hooks
  const deleteBreak = useDeleteBreak();
  
  // Fetch staff users for filter dropdown
  const { data: staffData } = useGetAllUsers({ role: 'staff' });
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

    // Add staff filter if not "all"
    if (filterStaff !== 'all') {
      apiParams.staffId = filterStaff;
    }

    return apiParams;
  }, [debouncedSearch, filterStaff, currentPage, itemsPerPage]);

  // Fetch breaks with current params
  const { data, isLoading, isError, error } = useGetAllBreaks(params);

  // Extract breaks and pagination from API response
  const breaks = (data as any)?.breaks || [];
  const pagination = (data as any)?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  /**
   * Open delete confirmation modal
   * Sets the break to delete and opens the modal
   */
  const handleDeleteClick = useCallback((breakId: string, staffName: string) => {
    setBreakToDelete({ id: breakId, name: staffName });
    setDeleteModalOpen(true);
  }, []);

  /**
   * Close delete confirmation modal
   * Clears the break to delete and closes the modal
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setBreakToDelete(null);
  }, []);

  /**
   * Confirm and execute break deletion
   * Calls the delete mutation and closes modal on success
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!breakToDelete) return;

    try {
      await deleteBreak.mutateAsync(breakToDelete.id);
      // Close modal on success
      setDeleteModalOpen(false);
      setBreakToDelete(null);
      // Cache invalidation handled by mutation onSuccess
    } catch (deleteError) {
      // Error handling is done in mutation's onError callback
      console.error('Delete break error:', deleteError);
      // Keep modal open on error so user can retry
    }
  }, [breakToDelete, deleteBreak]);

  /**
   * Handle filter changes
   * Resets to page 1 when filters change
   */
  const handleStaffFilterChange = (value: string) => {
    setFilterStaff(value);
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
    (error as any)?.response?.data?.message || 'Failed to load breaks.';

  return (
    <div className="space-y-6">
      {/* Page header with title and Add Break button */}
      <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Breaks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage staff breaks and schedules
          </p>
        </div>
        <Link to="/breaks/new" className="btn-primary flex items-center gap-2">
          <span className="">Add Break</span>
          <MdAdd size={24}/>
        </Link>
      </div>

      {/* Filters and search toolbar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
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
              placeholder="Search breaks..."
              className="input-search"
            />
          </div>
           
          {/* filters */}
          <div className="flex flex-row gap-2 flex-wrap items-center"> 

            {/* Staff filter */}
            <div>
              <select
                value={filterStaff}
                onChange={(e) => handleStaffFilterChange(e.target.value)}
                className="input-select w-full"
              >
                <option value="all">All Staff</option>
                {staffUsers.map((staff: IUser) => (
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

      {/* Breaks table */}
      <div className="table-container">
        <table className="table">
          {/* Table header */}
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">
                Staff
              </th>
              <th className="table-header-cell">
                Start Time
              </th>
              <th className="table-header-cell">
                End Time
              </th>
              <th className="table-header-cell">
                Reason
              </th>
              <th className="table-header-cell">
                Created
              </th>
              <th className="table-header-cell-right">
                Actions
              </th>
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
                      <div className="table-cell-content">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300" />
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
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
                <td colSpan={6} className="table-cell-center">
                  <div className="alert-error mx-auto max-w-md">{errorMessage}</div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && breaks.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center">
                  <p className="text-gray-500">No breaks found.</p>
                  {debouncedSearch || filterStaff !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search or filters.
                    </p>
                  ) : null}
                </td>
              </tr>
            )}

            {/* Break rows */}
            {!isLoading &&
              !isError &&
              breaks.map((breakItem: IBreak) => {
                const staffName = getStaffName(breakItem);
                const staffInitials = getStaffInitials(breakItem);
                const staffUser = typeof breakItem.staffId === 'object' ? breakItem.staffId : null;

                return (
                  <tr
                    key={breakItem._id}
                    className="table-row"
                  >
                    {/* Staff */}
                    <td className="table-cell">
                      <div className="table-cell-content">
                        {staffUser?.avatar ? (
                          <img
                            src={staffUser.avatar}
                            alt={staffName}
                            className="table-avatar"
                          />
                        ) : (
                          <div className="table-avatar-initials">
                            {staffInitials}
                          </div>
                        )}
                        <div className="font-medium text-gray-900">
                          {staffName}
                        </div>
                      </div>
                    </td>

                    {/* Start Time */}
                    <td className="table-cell-text">
                      {formatBreakDateTime(breakItem.startTime)}
                    </td>

                    {/* End Time */}
                    <td className="table-cell-text">
                      {formatBreakDateTime(breakItem.endTime)}
                    </td>

                    {/* Reason */}
                    <td className="table-cell">
                      {breakItem.reason ? (
                        <span className="badge badge-soft">{breakItem.reason}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Created date */}
                    <td className="table-cell-text">
                      {formatBreakDateTime(breakItem.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/breaks/${breakItem._id}`}
                          className="btn-ghost btn-sm flex items-center gap-1"
                          title="View break"
                        >
                          <MdVisibility className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/breaks/${breakItem._id}/edit`}
                          className="btn-secondary btn-sm flex items-center gap-1"
                          title="Edit break"
                        >
                          <MdEdit className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(breakItem._id, staffName)
                          }
                          className="btn-ghost btn-sm flex items-center gap-1 text-red-600 hover:text-red-700"
                          title="Delete break"
                          disabled={deleteBreak.isPending}
                        >
                          <MdDelete className="h-4 w-4" />
                        </button>
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

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Break"
        message={
          breakToDelete
            ? `Are you sure you want to delete the break for "${breakToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this break? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteBreak.isPending}
      />
    </div>
  );
};

export default BreakList;
