import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiUser, FiPhone, FiFileText, FiMessageSquare, FiCalendar, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import {
  useGetContactMessageById,
  useUpdateContactStatus,
} from '../../../tanstack/useContact';
import StatusBadge from '../../../components/ui/StatusBadge';
import {
  formatDateTimeWithTime,
} from '../../../utils/contactUtils';
import type { IContact, ContactStatus } from '../../../types/api.types';

/**
 * ContactDetails Component
 *
 * Displays detailed information about a specific contact message.
 * Shows name, email, phone, subject, message, status, timestamps, and user information.
 * Provides status update and reply navigation.
 *
 * Features:
 * - Contact header with subject and status badge
 * - Full contact information display
 * - Status update dropdown
 * - Reply navigation
 * - Loading and error states
 */
const ContactDetails = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch contact data
  const { data, isLoading, isError, error } = useGetContactMessageById(id || '');

  // Update status mutation
  const updateStatus = useUpdateContactStatus();

  // Extract contact from API response
  const contact = (data as any)?.contact ?? (data as IContact);

  // Status update state
  const [selectedStatus, setSelectedStatus] = useState<ContactStatus | ''>('');

  /**
   * Update contact status
   */
  const handleStatusUpdate = useCallback(async () => {
    if (!contact || !selectedStatus) return;
    try {
      await updateStatus.mutateAsync({
        contactId: contact._id,
        statusData: { status: selectedStatus as ContactStatus },
      });
      setSelectedStatus('');
    } catch (error) {
      // Error handled by mutation onError
      console.error('Update status error:', error);
    }
  }, [contact, selectedStatus, updateStatus]);

  // Get error message from API response
  const errorMessage =
    (error as any)?.response?.data?.message || 'Failed to load contact.';

  // Get user information if userId exists (must be called before any early returns)
  const userInfo = useMemo(() => {
    if (!contact) return null;
    if (contact.userId && typeof contact.userId === 'object') {
      return contact.userId;
    }
    return null;
  }, [contact]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="flex flex-col gap-4">
            <div className="h-8 w-64 bg-gray-300 rounded" />
            <div className="h-6 w-24 bg-gray-300 rounded-full" />
          </div>
        </div>
        {/* Contact Information skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded" />
                <div className="h-4 w-48 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        </div>
        {/* Message Content skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-300 rounded" />
            <div className="h-4 w-5/6 bg-gray-300 rounded" />
            <div className="h-4 w-4/6 bg-gray-300 rounded" />
          </div>
        </div>
        {/* Timestamps skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-32 bg-gray-300 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded" />
                <div className="h-4 w-48 bg-gray-300 rounded" />
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
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Contact</h2>
          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
        </div>
        <Link to="/contact" className="btn-secondary">
          Back to Contacts
        </Link>
      </div>
    );
  }

  // No contact found
  if (!contact) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <FiXCircle className="h-16 w-16 text-gray-400" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Contact Not Found</h2>
          <p className="mt-2 text-sm text-gray-500">The contact you're looking for doesn't exist.</p>
        </div>
        <Link to="/contact" className="btn-secondary">
          Back to Contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contact header card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Header with back button and actions */}
          <div className="flex items-center justify-between">
            <Link
              to="/contact"
              className="btn-ghost flex items-center gap-2"
            >
              <FiArrowLeft size={20} />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to={`/contact/${contact._id}/reply`}
                className="btn-primary flex items-center gap-2"
              >
                <FiSend size={18} />
                <span>Reply</span>
              </Link>
            </div>
          </div>

          {/* Subject and status badge */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              {contact.subject}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={contact.status} type="contact-status" />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiUser className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiUser className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">From</p>
              <p className="text-sm text-gray-700">
                {contact.name} &lt;{contact.email}&gt;
              </p>
            </div>
          </div>
          {contact.phone && (
            <div className="flex items-start gap-3">
              <FiPhone className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase text-gray-400 mb-1">Phone</p>
                <p className="text-sm text-gray-700">{contact.phone}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <FiFileText className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Subject</p>
              <p className="text-sm text-gray-700">{contact.subject}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Content Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiMessageSquare className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Message Content</h2>
        </div>
        <div className="flex items-start gap-3 mb-2">
          <FiMessageSquare className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs uppercase text-gray-400">Message</p>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap ml-8">
          {contact.message}
        </p>
      </div>

      {/* User Account Section */}
      {userInfo && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiUser className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">User Account</h2>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Name:</span>{' '}
              {userInfo.firstName} {userInfo.lastName}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Email:</span> {userInfo.email}
            </p>
          </div>
        </div>
      )}

      {/* Timestamps Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">Timestamps</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiCalendar className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Created</p>
              <p className="text-sm text-gray-700">
                {formatDateTimeWithTime(contact.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiCalendar className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Updated</p>
              <p className="text-sm text-gray-700">
                {formatDateTimeWithTime(contact.updatedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiCheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Status</p>
              <StatusBadge status={contact.status} type="contact-status" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Update Status
        </h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="label">Status</label>
            <select
              value={selectedStatus || contact.status}
              onChange={(e) => setSelectedStatus(e.target.value as ContactStatus)}
              className="input-select"
            >
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          {selectedStatus && selectedStatus !== contact.status && (
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={updateStatus.isPending}
              className="btn-primary"
            >
              {updateStatus.isPending ? 'Updating...' : 'Update Status'}
            </button>
          )}
        </div>
        {updateStatus.isError && (
          <div className="mt-3 alert-error">
            {(updateStatus.error as any)?.response?.data?.message ||
              'Failed to update status.'}
          </div>
        )}
        {updateStatus.isSuccess && (
          <div className="mt-3 alert-success">Status updated successfully.</div>
        )}
      </div>
    </div>
  );
};

export default ContactDetails;
