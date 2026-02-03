import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVisibility, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useGetAllUsers, useDeleteUser } from '../../../tanstack/useUsers';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { formatDateTime, getUserInitials, getRoleDisplayName } from '../../../utils/userUtils';
import type { IUser } from '../../../types/api.types';

/**
 * UserList Component
 * 
 * Displays a paginated table of all users with search, filtering, and CRUD actions.
 * Features:
 * - Search by name/email with debounce
 * - Filter by role and status
 * - Pagination controls
 * - View, Edit, Delete actions per user
 * - Loading skeleton, error, and empty states
 */
const UserList = () => {

  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // TanStack Query hooks
  const deleteUser = useDeleteUser();

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

    // Add role filter if not "all"
    if (filterRole !== 'all') {
      apiParams.role = filterRole;
    }

    // Add status filter if not "all"
    if (filterStatus !== 'all') {
      apiParams.status = filterStatus === 'active' ? 'active' : 'inactive';
    }

    return apiParams;
  }, [debouncedSearch, filterRole, filterStatus, currentPage, itemsPerPage]);

  // Fetch users with current params
  const { data, isLoading, isError, error } = useGetAllUsers(params);

  // Extract users and pagination from API response
  const users = (data as any)?.users || [];
  const pagination = (data as any)?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  /**
   * Open delete confirmation modal
   * Sets the user to delete and opens the modal
   */
  const handleDeleteClick = useCallback((userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteModalOpen(true);
  }, []);

  /**
   * Close delete confirmation modal
   * Clears the user to delete and closes the modal
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  }, []);

  /**
   * Confirm and execute user deletion
   * Calls the delete mutation and closes modal on success
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync(userToDelete.id);
      // Close modal on success
      setDeleteModalOpen(false);
      setUserToDelete(null);
      // Cache invalidation handled by mutation onSuccess
    } catch (deleteError) {
      // Error handling is done in mutation's onError callback
      console.error('Delete user error:', deleteError);
      // Keep modal open on error so user can retry
    }
  }, [userToDelete, deleteUser]);

  /**
   * Handle filter changes
   * Resets to page 1 when filters change
   */
  const handleRoleFilterChange = (value: string) => {
    setFilterRole(value);
    setCurrentPage(1);
  };

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
    (error as any)?.response?.data?.message || 'Failed to load users.';

  return (
    <div className="space-y-6">
      {/* Page header with title and Add User button */}
      <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts and permissions
          </p>
        </div>
        <Link to="/users/new" className="btn-primary flex items-center gap-2">
           <span className="">Add User</span>
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
              placeholder="Search users..."
              className="input-search"
            />
          </div>
           
           {/* filters */}
          <div className="flex flex-row gap-2 flex-wrap items-center"> 

            {/* Role filter */}
            <div>
              <select
                value={filterRole}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="input-select w-full"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="customer">Customer</option>
              </select>
            </div>

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

      {/* Users table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[800px]">
          {/* Table header */}
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                User
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Created
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="divide-y divide-gray-200 bg-white">
            {/* Loading state: skeleton rows */}
            {isLoading && (
              <>
                {[...Array(5)].map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300" />
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-gray-300" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-300" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="px-6 py-4" />
                  </tr>
                ))}
              </>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="alert-error mx-auto max-w-md">{errorMessage}</div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <p className="text-gray-500">No users found.</p>
                  {debouncedSearch || filterRole !== 'all' || filterStatus !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search or filters.
                    </p>
                  ) : null}
                </td>
              </tr>
            )}

            {/* User rows */}
            {!isLoading &&
              !isError &&
              users.map((user: IUser) => (
                <tr
                  key={user._id}
                  className="transition hover:bg-gray-50"
                >
                  {/* Avatar and name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
                          {getUserInitials(user)}
                        </div>
                      )}
                      <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className="badge badge-soft">{getRoleDisplayName(user)}</span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={
                        user.isActive
                          ? 'badge badge-success'
                          : 'badge badge-error'
                      }
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Created date */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDateTime(user.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/users/${user._id}`}
                        className="btn-ghost btn-sm flex items-center gap-1"
                        title="View user"
                      >
                        <MdVisibility className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/users/${user._id}/edit`}
                        className="btn-secondary btn-sm flex items-center gap-1"
                        title="Edit user"
                      >
                        <MdEdit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteClick(user._id, `${user.firstName} ${user.lastName}`)
                        }
                        className="btn-ghost btn-sm flex items-center gap-1 text-red-600 hover:text-red-700"
                        title="Delete user"
                        disabled={deleteUser.isPending}
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
        title="Delete User"
        message={
          userToDelete
            ? `Are you sure you want to delete user "${userToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this user? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteUser.isPending}
      />
    </div>
  );
};

export default UserList;
