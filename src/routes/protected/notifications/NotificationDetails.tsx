import { useCallback, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiCheckCircle, FiMessageSquare, FiTag, FiCalendar, FiSend, FiCheck, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import {
  useGetNotification,
  useMarkNotificationAsRead,
  useDeleteNotification,
} from '../../../tanstack/useNotifications';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StatusBadge from '../../../components/ui/StatusBadge';
import {
  formatDateTimeWithTime,
  isNotificationUnread,
} from '../../../utils/notificationUtils';
import type { INotification, INotificationAction } from '../../../types/api.types';

/**
 * NotificationDetails Component
 *
 * Displays detailed information about a specific notification.
 * Shows subject, message, category, type, read status, timestamps, metadata, context, and actions.
 * Provides Mark as Read and Delete buttons.
 *
 * Features:
 * - Notification header with subject and badges
 * - Full message content
 * - Metadata and context display
 * - Timestamps (created, sent, read)
 * - Action buttons (if available)
 * - Mark as read and delete actions
 * - Loading and error states
 */
const NotificationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch notification data
  const { data, isLoading, isError, error } = useGetNotification(id || '');

  // Mutations
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Extract notification from API response
  const notification = (data as any)?.notification ?? (data as INotification);

  // Check if notification is unread
  const isUnread = useMemo(() => {
    if (!notification) return false;
    return isNotificationUnread(notification);
  }, [notification]);

  /**
   * Mark notification as read
   */
  const handleMarkAsRead = useCallback(async () => {
    if (!notification || !isUnread) return;
    try {
      await markAsRead.mutateAsync(notification._id);
    } catch (error) {
      // Error handled by mutation onError
      console.error('Mark as read error:', error);
    }
  }, [notification, isUnread, markAsRead]);

  /**
   * Open delete confirmation modal
   */
  const handleDeleteClick = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);

  /**
   * Close delete confirmation modal
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
  }, []);

  /**
   * Confirm and execute notification deletion
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!notification) return;
    try {
      await deleteNotification.mutateAsync(notification._id);
      navigate('/notifications');
    } catch (error) {
      // Error handled by mutation onError
      console.error('Delete notification error:', error);
    }
  }, [notification, deleteNotification, navigate]);

  /**
   * Handle action button click
   */
  const handleActionClick = useCallback(
    async (action: INotificationAction) => {
      if (action.type === 'navigate' && action.route) {
        navigate(action.route);
      } else if (action.type === 'api' && action.endpoint) {
        // TODO: Implement API call handling
        console.log('API action:', action);
      } else if (action.type === 'modal' && action.modal) {
        // TODO: Implement modal handling
        console.log('Modal action:', action);
      } else if (action.type === 'confirm' && action.requiresConfirmation) {
        // TODO: Implement confirmation handling
        console.log('Confirm action:', action);
      }
    },
    [navigate]
  );

  // Get error message from API response
  const errorMessage =
    (error as any)?.response?.data?.message || 'Failed to load notification.';

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-8 w-64 bg-gray-300 rounded mb-4" />
          <div className="flex gap-2">
            <div className="h-6 w-24 bg-gray-300 rounded-full" />
            <div className="h-6 w-20 bg-gray-300 rounded-full" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-300 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <FiAlertTriangle className="h-16 w-16 text-red-500" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Notification</h2>
          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
        </div>
        <Link to="/notifications" className="btn-secondary">
          Back to Notifications
        </Link>
      </div>
    );
  }

  // No notification found
  if (!notification) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <FiXCircle className="h-16 w-16 text-gray-400" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Notification Not Found</h2>
          <p className="mt-2 text-sm text-gray-500">The notification you're looking for doesn't exist.</p>
        </div>
        <Link to="/notifications" className="btn-secondary">
          Back to Notifications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification header card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Header with back button and actions */}
          <div className="flex items-center justify-between">
            <Link
              to="/notifications"
              className="btn-ghost flex items-center gap-2"
            >
              <FiArrowLeft size={20} />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-2">
              {isUnread && (
                <button
                  type="button"
                  onClick={handleMarkAsRead}
                  disabled={markAsRead.isPending}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiCheckCircle size={18} />
                  <span>Mark as Read</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={deleteNotification.isPending}
                className="btn-ghost flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <FiTrash2 size={18} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Subject and badges */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              {notification.subject}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={notification.category} type="notification-category" />
              <StatusBadge status={notification.type} type="notification-type" />
              {notification.status && (
                <StatusBadge status={notification.status} type="notification-status" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification details card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Notification Details
        </h2>

        {/* Message */}
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-2">
            <FiMessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs uppercase text-gray-400">Message</p>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap ml-8">
            {notification.message}
          </p>
        </div>

        {/* Metadata */}
        {notification.metadata && Object.keys(notification.metadata).length > 0 && (
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-2">
              <FiTag className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs uppercase text-gray-400">Metadata</p>
            </div>
            <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto ml-8">
              {JSON.stringify(notification.metadata, null, 2)}
            </pre>
          </div>
        )}

        {/* Context */}
        {notification.context && (
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-2">
              <FiTag className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs uppercase text-gray-400">Context</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg ml-8">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Resource ID:</span>{' '}
                {notification.context.resourceId}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">Resource Type:</span>{' '}
                {notification.context.resourceType}
              </p>
              {notification.context.additionalData &&
                Object.keys(notification.context.additionalData).length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Additional Data:</p>
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(notification.context.additionalData, null, 2)}
                    </pre>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiCalendar className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Created</p>
              <p className="text-sm text-gray-700">
                {formatDateTimeWithTime(notification.createdAt)}
              </p>
            </div>
          </div>
          {notification.sentAt && (
            <div className="flex items-start gap-3">
              <FiSend className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase text-gray-400 mb-1">Sent</p>
                <p className="text-sm text-gray-700">
                  {formatDateTimeWithTime(notification.sentAt)}
                </p>
              </div>
            </div>
          )}
          {notification.readAt && (
            <div className="flex items-start gap-3">
              <FiCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase text-gray-400 mb-1">Read</p>
                <p className="text-sm text-gray-700">
                  {formatDateTimeWithTime(notification.readAt)}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <FiCheckCircle className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Status</p>
              {notification.status && (
                <StatusBadge status={notification.status} type="notification-status" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions card */}
      {notification.actions && notification.actions.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {notification.actions.map((action: INotificationAction) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleActionClick(action)}
                className={`btn ${
                  action.variant === 'danger'
                    ? 'btn-secondary bg-red-600 text-white hover:bg-red-700'
                    : action.variant === 'success'
                    ? 'btn-secondary bg-emerald-600 text-white hover:bg-emerald-700'
                    : action.variant === 'secondary'
                    ? 'btn-secondary'
                    : 'btn-primary'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Notification"
        message={`Are you sure you want to delete notification "${notification.subject}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteNotification.isPending}
      />
    </div>
  );
};

export default NotificationDetails;
