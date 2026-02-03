import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVisibility, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useGetAllRoles, useDeleteRole } from '../../../tanstack/useRoles';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
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
  const roles = (data as any)?.roles || [];
  const pagination = (data as any)?.pagination || {
    page: 1,
    limit: 10,
    total: roles.length,
    totalPages: 1,
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
      <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage role permissions and access levels
          </p>
        </div>
        <Link to="/roles/new" className="btn-primary flex items-center gap-2">
           <span className="">Add Role</span>
           <MdAdd size={24}/>
        </Link>
      </div>

      {/* Filters and search toolbar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
          {/* Search input */}
          <div className="relative ">
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
              placeholder="Search roles..."
              className="input-search"
            />
          </div>
           
           {/* filters */}
          <div className="flex flex-row gap-2 flex-wrap items-center"> 

            {/* Status filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="input-select w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
                    <td className="table-cell" />
                  </tr>
                ))}
              </>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <tr>
                <td colSpan={5} className="table-cell-center">
                  <div className="alert-error mx-auto max-w-md">{errorMessage}</div>
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
                    <span
                      className={
                        role.isActive
                          ? 'badge badge-success'
                          : 'badge badge-error'
                      }
                    >
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
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
                        className="btn-ghost btn-sm flex items-center gap-1"
                        title="View role"
                      >
                        <MdVisibility className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/roles/${role._id}/edit`}
                        className="btn-secondary btn-sm flex items-center gap-1"
                        title="Edit role"
                      >
                        <MdEdit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteClick(role._id, role.displayName || role.name)
                        }
                        className="btn-ghost btn-sm flex items-center gap-1 text-red-600 hover:text-red-700"
                        title="Delete role"
                        disabled={deleteRole.isPending}
                      >
                        <MdDelete className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoading && !isError && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page || currentPage}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.total || roles.length}
            pageSize={pagination.limit || itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

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
