import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { FiSearch, FiFilter, FiList, FiEye, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useGetAllUsers, useDeleteUser } from '../../../tanstack/useUsers';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatDateTime, getUserInitials } from '../../../utils/userUtils';
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
  const users = data?.users ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false,
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
  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  return (
    <div className="space-y-6">
      {/* Page header with title and Add User button */}
      <header className="">
        {/* title and description */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts and permissions
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
                placeholder="Search users..."
                className="input-search"
              />
            </div>
          </div>

          {/* Add user button */}
          <Link to="/users/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span className="">Add User</span>
            <MdAdd size={24}/>
          </Link>
        </div>

        {/* user count & filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* user count */}
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalUsers} users</p>
          </div>

          {/* filters */}
          <div className="flex flex-wrap gap-2">
            {/* Role filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterRole}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="customer">Customer</option>
              </select>
            </div>

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

      {/* Users table */}
      <div className="table-container">
        <table className="table">
          {/* Table header */}
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">
                User
              </th>
              <th className="table-header-cell">
                Email
              </th>
              <th className="table-header-cell">
                Role
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
                      <div className="table-cell-content">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300" />
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-gray-300" />
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
                <td colSpan={6} className="table-cell-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FiAlertTriangle className="text-brand-accent" size={48} />
                    <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && users.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center">
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
                  className="table-row"
                >
                  {/* Avatar and name */}
                  <td className="table-cell">
                    <div className="table-cell-content">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="table-avatar"
                        />
                      ) : (
                        <div className="table-avatar-initials">
                          {getUserInitials(user)}
                        </div>
                      )}
                      <div className="font-medium text-gray-900 whitespace-nowrap">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="table-cell-text">
                    {user.email}
                  </td>

                  {/* Role */}
                  <td className="table-cell">
                    <div className="flex  gap-1 whitespace-nowrap">
                      {user.roles.map((role) => (
                        <StatusBadge
                          key={role._id}
                          status={role.name}
                          type="user-role"
                        />
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="table-cell">
                    <StatusBadge
                      status={user.isActive ? 'active' : 'inactive'}
                      type="user-status"
                    />
                  </td>

                  {/* Created date */}
                  <td className="table-cell-text">
                    {formatDateTime(user.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/users/${user._id}`}
                        className="flex items-center justify-center rounded-lg bg-white p-2 text-blue-600 transition hover:bg-blue-50"
                        title="View user"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/users/${user._id}/edit`}
                        className="flex items-center justify-center rounded-lg bg-white p-2 text-teal-600 transition hover:bg-teal-50"
                        title="Edit user"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteClick(user._id, `${user.firstName} ${user.lastName}`)
                        }
                        className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        title="Delete user"
                        disabled={deleteUser.isPending}
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
            totalItems={pagination.totalUsers}
            currentPageCount={users.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

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
