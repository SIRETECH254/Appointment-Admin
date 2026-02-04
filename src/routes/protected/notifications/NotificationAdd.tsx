import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSendNotification, useSendBulkNotification } from '../../../tanstack/useNotifications';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import type { SendNotificationPayload, SendBulkNotificationPayload, IUser } from '../../../types/api.types';

/**
 * Inline message type for form feedback
 */
type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

/**
 * NotificationAdd Component
 *
 * Allows admin to create and send a new notification to a user.
 * All required fields must be filled, and metadata must be valid JSON if provided.
 *
 * Features:
 * - Form validation (required fields, subject length, metadata JSON)
 * - Creates notification via API
 * - Shows success/error feedback
 * - Navigates to notification details on success
 * - Admin-only access
 */
const NotificationAdd = () => {
  const navigate = useNavigate();

  // TanStack Query hooks
  const sendNotification = useSendNotification();
  const sendBulkNotification = useSendBulkNotification();
  const { data: usersData } = useGetAllUsers({ limit: 1000 }); // Get all users for recipient selection

  // Extract users from API response
  const users = (usersData as any)?.users || (usersData as any)?.items || [];

  // Form state
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [type, setType] = useState<'email' | 'sms' | 'in_app'>('in_app');
  const [category, setCategory] = useState<'general' | 'appointment' | 'payment'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [metadata, setMetadata] = useState('');

  // UI state
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect timer ref for cleanup
  const redirectTimer = useRef<number | null>(null);



  /**
   * Cleanup redirect timer on unmount
   */
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        window.clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  /**
   * Determine if form can be submitted
   * Requires all required fields, subject length <= 200, and valid metadata JSON if provided
   */
  const canSubmit = useMemo(() => {
    const hasMetadata = metadata.trim().length > 0;
    let metadataValid = true;
    if (hasMetadata) {
      try {
        JSON.parse(metadata.trim());
        metadataValid = true;
      } catch {
        metadataValid = false;
      }
    }

    // For bulk mode, require at least one recipient
    const hasRecipients = isBulkMode
      ? recipients.length > 0
      : Boolean(recipient);

    return (
      Boolean(
        hasRecipients &&
        type &&
        category &&
        subject.trim() &&
        message.trim() &&
        subject.trim().length <= 200 &&
        metadataValid
      ) && !isSubmitting
    );
  }, [isBulkMode, recipient, recipients, type, category, subject, message, metadata, isSubmitting]);

  /**
   * Handle form submission
   * Validates all fields, builds payload, and calls create mutation
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Trim all input values
      const trimmedSubject = subject.trim();
      const trimmedMessage = message.trim();
      const trimmedMetadata = metadata.trim();

      // Client-side validation
      if (isBulkMode) {
        if (recipients.length === 0 || !type || !category || !trimmedSubject || !trimmedMessage) {
          setInlineMessage({
            type: 'error',
            text: 'All required fields must be filled. Select at least one recipient for bulk notification.',
          });
          return;
        }
      } else {
        if (!recipient || !type || !category || !trimmedSubject || !trimmedMessage) {
          setInlineMessage({
            type: 'error',
            text: 'All required fields must be filled.',
          });
          return;
        }
      }

      // Validate subject length
      if (trimmedSubject.length > 200) {
        setInlineMessage({
          type: 'error',
          text: 'Subject cannot exceed 200 characters.',
        });
        return;
      }

      // Validate metadata JSON if provided
      let parsedMetadata = undefined;
      if (trimmedMetadata) {
        try {
          parsedMetadata = JSON.parse(trimmedMetadata);
        } catch {
          setInlineMessage({
            type: 'error',
            text: 'Invalid JSON format for metadata.',
          });
          return;
        }
      }

      setInlineMessage(null);
      setIsSubmitting(true);

      try {
        if (isBulkMode) {
          // Build bulk notification payload
          const bulkData: SendBulkNotificationPayload = {
            recipients,
            type,
            category,
            subject: trimmedSubject,
            message: trimmedMessage,
          };

          // Call bulk notification mutation
          const result = await sendBulkNotification.mutateAsync(bulkData);

          // Show success message with summary
          const summary = result as any;
          setInlineMessage({
            type: 'success',
            text: `Bulk notification sent: ${summary.success || 0} successful, ${summary.failed || 0} failed out of ${summary.total || recipients.length} recipients.`,
          });

          // Navigate to notification list after delay
          redirectTimer.current = window.setTimeout(() => {
            navigate('/notifications', { replace: true });
          }, 2000);
        } else {
          // Build single notification payload
          const notificationData: SendNotificationPayload = {
            recipient,
            type,
            category,
            subject: trimmedSubject,
            message: trimmedMessage,
          };

          // Add metadata if provided
          if (parsedMetadata) {
            notificationData.metadata = parsedMetadata;
          }

          // Call create mutation
          const result = await sendNotification.mutateAsync(notificationData);

          // Extract notification ID from response
          const createdNotification = (result as any)?.notification ?? result;
          const notificationId = createdNotification?._id || (result as any)?._id;

          // Show success message
          setInlineMessage({
            type: 'success',
            text: 'Notification sent successfully.',
          });

          // Navigate to notification details page after delay
          if (notificationId) {
            redirectTimer.current = window.setTimeout(() => {
              navigate(`/notifications/${notificationId}`, { replace: true });
            }, 1200);
          } else {
            // Fallback: navigate to notification list if no ID
            redirectTimer.current = window.setTimeout(() => {
              navigate('/notifications', { replace: true });
            }, 1200);
          }
        }
      } catch (submitError: any) {
        // Extract error message from API response
        const errorMessage =
          submitError?.response?.data?.message || `Failed to send ${isBulkMode ? 'bulk ' : ''}notification.`;
        setInlineMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [isBulkMode, recipient, recipients, type, category, subject, message, metadata, sendNotification, sendBulkNotification, navigate]
  );

  /**
   * Handle recipient selection toggle for bulk mode
   */
  const handleRecipientToggle = useCallback((userId: string) => {
    setRecipients((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  /**
   * Handle select all recipients
   */
  const handleSelectAll = useCallback(() => {
    if (recipients.length === users.length) {
      setRecipients([]);
    } else {
      setRecipients(users.map((user: IUser) => user._id));
    }
  }, [recipients.length, users]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create Notification</h1>
        <p className="mt-1 text-sm text-gray-500">
          Send a notification to a user
        </p>
      </div>

      {/* Create notification form */}
      <form
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        {/* Bulk mode toggle */}
        <div className="mb-6 flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isBulkMode}
              onChange={(e) => {
                setIsBulkMode(e.target.checked);
                setRecipient('');
                setRecipients([]);
              }}
              className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-sm font-medium text-gray-700">
              Send to multiple recipients (Bulk)
            </span>
          </label>
        </div>

        {/* Form fields grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recipient(s) */}
          {isBulkMode ? (
            <div className="auth-field md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="label">
                  Recipients <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({recipients.length} selected)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-brand-primary hover:underline"
                >
                  {recipients.length === users.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-xl p-3 space-y-2">
                {users.length === 0 ? (
                  <p className="text-sm text-gray-500">No users available</p>
                ) : (
                  users.map((user: IUser) => (
                    <label
                      key={user._id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={recipients.includes(user._id)}
                        onChange={() => handleRecipientToggle(user._id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-gray-700">
                        {user.firstName} {user.lastName} ({user.email})
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="auth-field md:col-span-2">
              <label className="label">
                Recipient <span className="text-red-500">*</span>
              </label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="input-select w-full"
                required
              >
                <option value="">Select user</option>
                {users.map((user: IUser) => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Type */}
          <div className="auth-field">
            <label className="label">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'email' | 'sms' | 'in_app')}
              className="input-select w-full"
              required
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="in_app">In-app</option>
            </select>
          </div>

          {/* Category */}
          <div className="auth-field">
            <label className="label">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as 'general' | 'appointment' | 'payment')
              }
              className="input-select w-full"
              required
            >
              <option value="general">General</option>
              <option value="appointment">Appointment</option>
              <option value="payment">Payment</option>
            </select>
          </div>

          {/* Subject */}
          <div className="auth-field md:col-span-2">
            <label className="label">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Notification subject"
              className="input"
              required
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500">
              {subject.length}/200 characters
            </p>
          </div>

          {/* Message */}
          <div className="auth-field md:col-span-2">
            <label className="label">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              className="input"
              rows={6}
              required
            />
          </div>

          {/* Metadata (optional) */}
          <div className="auth-field md:col-span-2">
            <label className="label">Metadata (optional)</label>
            <textarea
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder='{"key": "value"}'
              className="input font-mono text-sm"
              rows={4}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter valid JSON format (optional)
            </p>
          </div>
        </div>

        {/* Inline success/error message */}
        {inlineMessage ? (
          <div
            className={
              inlineMessage.type === 'success'
                ? 'alert-success mt-4'
                : 'alert-error mt-4'
            }
          >
            {inlineMessage.text}
          </div>
        ) : null}

        {/* Form actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link to="/notifications" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!canSubmit || sendNotification.isPending || sendBulkNotification.isPending}
            className="btn-primary"
          >
            {isSubmitting || sendNotification.isPending || sendBulkNotification.isPending
              ? 'Sending...'
              : isBulkMode
              ? `Send to ${recipients.length} Recipient${recipients.length !== 1 ? 's' : ''}`
              : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationAdd;
