import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { FiSearch, FiFilter, FiList, FiEye, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useGetAllRoles, useDeleteRole } from '../../../tanstack/useRoles';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatDateTime, getRoleInitials } from '../../../utils/roleUtils';
import type { IRole } from '../../../types/api.types';

/**
 * RoleList Component
 * 
 * Displays a paginated table of all roles with search, filtering, and CRUD actions.
 * Features:
 * - Search by name/displayName/description with debounce
 * - Filter by active status
 * - Pagination controls
 * - View, Edit, Delete actions per role
 * - System role protection (cannot delete system roles)
 * - Loading skeleton, error, and empty states
 */
const RoleList = () => {

  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // TanStack Query hooks
  const deleteRole = useDeleteRole();

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
      apiParams.isActive = filterStatus === 'active' ? 'true' : 'false';
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);

  // Fetch roles with current params
  const { data, isLoading, isError, error } = useGetAllRoles(params);

  // Extract roles and pagination from API response
  const roles = data?.roles ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalRoles: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  /**
   * Open delete confirmation modal
   * Sets the role to delete and opens the modal
   */
  const handleDeleteClick = useCallback((roleId: string, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
    setDeleteModalOpen(true);
  }, []);

  /**
   * Close delete confirmation modal
   * Clears the role to delete and closes the modal
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setRoleToDelete(null);
  }, []);

  /**
   * Confirm and execute role deletion
   * Calls the delete mutation and closes modal on success
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole.mutateAsync(roleToDelete.id);
      // Close modal on success
      setDeleteModalOpen(false);
      setRoleToDelete(null);
      // Cache invalidation handled by mutation onSuccess
    } catch (deleteError) {
      // Error handling is done in mutation's onError callback
      console.error('Delete role error:', deleteError);
      // Keep modal open on error so user can retry
    }
  }, [roleToDelete, deleteRole]);

  /**
   * Handle filter changes
   * Resets to page 1 when filters change
   */
  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
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
    (error as any)?.response?.data?.message || 'Failed to load roles.';

  return (
    <div className="space-y-6">
      {/* Page header with title and Add Role button */}
      <header className="">
        {/* title and description */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage role permissions and access levels
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
                placeholder="Search roles..."
                className="input-search"
              />
            </div>
          </div>

          {/* Add role button */}
          <Link to="/roles/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span className="">Add Role</span>
            <MdAdd size={24}/>
          </Link>
        </div>

        {/* role count & filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* role count */}
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalRoles} roles</p>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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

      {/* Roles table */}
      <div className="table-container">
        <table className="table">
          {/* Table header */}
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">
                Name
              </th>
              <th className="table-header-cell">
                Display Name
              </th>
              <th className="table-header-cell">
                Status
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
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-300" />
                        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-300" />
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
                <td colSpan={5} className="table-cell-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FiAlertTriangle className="text-brand-accent" size={48} />
                    <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && roles.length === 0 && (
              <tr>
                <td colSpan={5} className="table-cell-center">
                  <p className="text-gray-500">No roles found.</p>
                  {debouncedSearch || filterStatus !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search or filters.
                    </p>
                  ) : null}
                </td>
              </tr>
            )}

            {/* Role rows */}
            {!isLoading &&
              !isError &&
              roles.map((role: IRole) => (
                <tr
                  key={role._id}
                  className="table-row"
                >
                  {/* Name */}
                  <td className="table-cell">
                    <div className="table-cell-content">
                      <div className="table-avatar-initials">
                        {getRoleInitials(role)}
                      </div>
                      <div className="font-medium text-gray-900">
                        {role.name}
                      </div>
                    </div>
                  </td>

                  {/* Display Name */}
                  <td className="table-cell-text">
                    {role.displayName}
                  </td>

                  {/* Status */}
                  <td className="table-cell">
                    <StatusBadge status={role.isActive} type="service-status" />
                  </td>

                  {/* Created date */}
                  <td className="table-cell-text">
                    {formatDateTime(role.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/roles/${role._id}`}
                        className="flex items-center justify-center rounded-lg bg-white p-2 text-blue-600 transition hover:bg-blue-50"
                        title="View role"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/roles/${role._id}/edit`}
                        className="flex items-center justify-center rounded-lg bg-white p-2 text-teal-600 transition hover:bg-teal-50"
                        title="Edit role"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteClick(role._id, role.displayName || role.name)
                        }
                        className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        title="Delete role"
                        disabled={deleteRole.isPending}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - separate from table container */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalRoles}
            currentPageCount={roles.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Role"
        message={
          roleToDelete
            ? `Are you sure you want to delete role "${roleToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this role? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteRole.isPending}
      />
    </div>
  );
};

export default RoleList;
