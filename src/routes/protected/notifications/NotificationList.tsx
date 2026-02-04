import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVisibility, MdDelete, MdAdd, MdMarkEmailRead } from 'react-icons/md';
import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '../../../tanstack/useNotifications';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import {
  formatDateTime,
  getCategoryBadgeClass,
  getTypeDisplayName,
  isNotificationUnread,
} from '../../../utils/notificationUtils';
import type { INotification } from '../../../types/api.types';

/**
 * NotificationList Component
 *
 * Displays a paginated list of notifications with card layout, search, filtering, and CRUD actions.
 * Features:
 * - Search by subject/message with debounce
 * - Filter by category, type, and status
 * - Pagination controls
 * - Mark as read, Mark all as read, Delete actions
 * - Loading skeleton, error, and empty states
 * - Card-based layout (no table)
 */
const NotificationList = () => {
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<{
    id: string;
    subject: string;
  } | null>(null);

  // TanStack Query hooks
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

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

    // Add category filter if not "all"
    if (filterCategory !== 'all') {
      apiParams.category = filterCategory;
    }

    // Add type filter if not "all"
    if (filterType !== 'all') {
      apiParams.type = filterType;
    }

    // Add status filter if not "all"
    if (filterStatus !== 'all') {
      if (filterStatus === 'read') {
        apiParams.status = 'read';
      } else if (filterStatus === 'unread') {
        apiParams.status = 'unread';
      } else {
        apiParams.status = filterStatus;
      }
    }

    return apiParams;
  }, [debouncedSearch, filterCategory, filterType, filterStatus, currentPage, itemsPerPage]);

  // Fetch notifications with current params
  const { data, isLoading, isError, error } = useGetNotifications(params);

  // Extract notifications and pagination from API response
  const notifications = (data as any)?.notifications || [];
  const pagination = (data as any)?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalNotifications: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  /**
   * Open delete confirmation modal
   * Sets the notification to delete and opens the modal
   */
  const handleDeleteClick = useCallback(
    (notificationId: string, subject: string) => {
      setNotificationToDelete({ id: notificationId, subject });
      setDeleteModalOpen(true);
    },
    []
  );

  /**
   * Close delete confirmation modal
   * Clears the notification to delete and closes the modal
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setNotificationToDelete(null);
  }, []);

  /**
   * Confirm and execute notification deletion
   * Calls the delete mutation and closes modal on success
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!notificationToDelete) return;

    try {
      await deleteNotification.mutateAsync(notificationToDelete.id);
      // Close modal on success
      setDeleteModalOpen(false);
      setNotificationToDelete(null);
      // Cache invalidation handled by mutation onSuccess
    } catch (deleteError) {
      // Error handling is done in mutation's onError callback
      console.error('Delete notification error:', deleteError);
      // Keep modal open on error so user can retry
    }
  }, [notificationToDelete, deleteNotification]);

  /**
   * Mark a single notification as read
   */
  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markAsRead.mutateAsync(notificationId);
      } catch (error) {
        // Error handled by mutation onError
        console.error('Mark as read error:', error);
      }
    },
    [markAsRead]
  );

  /**
   * Mark all notifications as read
   */
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      // Error handled by mutation onError
      console.error('Mark all as read error:', error);
    }
  }, [markAllAsRead]);

  /**
   * Handle filter changes
   * Resets to page 1 when filters change
   */
  const handleCategoryFilterChange = (value: string) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (value: string) => {
    setFilterType(value);
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
    (error as any)?.response?.data?.message || 'Failed to load notifications.';

  return (
    <div className="space-y-6">
      {/* Page header with title and Create Notification button */}
      <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view all notifications
          </p>
        </div>
        <Link to="/notifications/new" className="btn-primary flex items-center gap-2">
          <span>Create Notification</span>
          <MdAdd size={20} />
        </Link>
      </div>

      {/* Filters and search toolbar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
          {/* Search input */}
          <div className="relative w-full md:w-auto">
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
              placeholder="Search notifications..."
              className="input-search"
            />
          </div>

          {/* filters */}
          <div className="flex flex-row gap-2 flex-wrap items-center w-full md:w-auto">
            {/* Category filter */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => handleCategoryFilterChange(e.target.value)}
                className="input-select w-full"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="appointment">Appointment</option>
                <option value="payment">Payment</option>
              </select>
            </div>

            {/* Type filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                className="input-select w-full"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in_app">In-app</option>
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
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
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

            {/* Mark all as read button */}
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="btn-secondary flex items-center gap-2"
            >
              <MdMarkEmailRead size={18} />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications cards */}
      <div className="space-y-4">
        {/* Loading state: skeleton cards */}
        {isLoading && (
          <>
            {[...Array(5)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-gray-300 rounded mb-2" />
                    <div className="h-4 w-64 bg-gray-300 rounded mb-4" />
                    <div className="h-4 w-48 bg-gray-300 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-gray-300 rounded-full" />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="alert-error">{errorMessage}</div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && notifications.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
            <p className="text-gray-500">No notifications found.</p>
            {debouncedSearch ||
            filterCategory !== 'all' ||
            filterType !== 'all' ||
            filterStatus !== 'all' ? (
              <p className="mt-2 text-sm text-gray-400">
                Try adjusting your search or filters.
              </p>
            ) : null}
          </div>
        )}

        {/* Notification cards */}
        {!isLoading &&
          !isError &&
          notifications.map((notification: INotification) => {
            const isUnread = isNotificationUnread(notification);
            return (
              <div
                key={notification._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side: content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={getCategoryBadgeClass(notification.category)}>
                        {notification.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getTypeDisplayName(notification.type)}
                      </span>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {notification.subject}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>

                  {/* Right side: actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification._id)}
                        disabled={markAsRead.isPending}
                        className="btn-ghost btn-sm flex items-center gap-1"
                        title="Mark as read"
                      >
                        <MdMarkEmailRead className="h-4 w-4" />
                      </button>
                    )}
                    <Link
                      to={`/notifications/${notification._id}`}
                      className="btn-ghost btn-sm flex items-center gap-1"
                      title="View notification"
                    >
                      <MdVisibility className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteClick(notification._id, notification.subject)
                      }
                      className="btn-ghost btn-sm flex items-center gap-1 text-red-600 hover:text-red-700"
                      title="Delete notification"
                      disabled={deleteNotification.isPending}
                    >
                      <MdDelete className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalNotifications}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Notification"
        message={
          notificationToDelete
            ? `Are you sure you want to delete notification "${notificationToDelete.subject}"? This action cannot be undone.`
            : 'Are you sure you want to delete this notification? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteNotification.isPending}
      />
    </div>
  );
};

export default NotificationList;
