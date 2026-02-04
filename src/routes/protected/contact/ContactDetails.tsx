import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MdArrowBack, MdReply } from 'react-icons/md';
import {
  useGetContactMessageById,
  useUpdateContactStatus,
} from '../../../tanstack/useContact';
import {
  formatDateTimeWithTime,
  getStatusBadgeClass,
  getStatusDisplayName,
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">
        Loading contact...
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="alert-error">{errorMessage}</div>
        <Link to="/contact" className="btn-secondary">
          Back to Contacts
        </Link>
      </div>
    );
  }

  // No contact found
  if (!contact) {
    return (
      <div className="space-y-4">
        <div className="alert-error">Contact not found.</div>
        <Link to="/contact" className="btn-secondary">
          Back to Contacts
        </Link>
      </div>
    );
  }

  // Get user information if userId exists
  const userInfo = useMemo(() => {
    if (contact.userId && typeof contact.userId === 'object') {
      return contact.userId;
    }
    return null;
  }, [contact]);

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
              <MdArrowBack size={20} />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to={`/contact/${contact._id}/reply`}
                className="btn-primary flex items-center gap-2"
              >
                <MdReply size={18} />
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
              <span className={getStatusBadgeClass(contact.status)}>
                {getStatusDisplayName(contact.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact details card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Details
        </h2>

        {/* Contact Information */}
        <div className="mb-6 space-y-3">
          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">From</p>
            <p className="text-sm text-gray-700">
              {contact.name} &lt;{contact.email}&gt;
            </p>
          </div>
          {contact.phone && (
            <div>
              <p className="text-xs uppercase text-gray-400 mb-1">Phone</p>
              <p className="text-sm text-gray-700">{contact.phone}</p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">Subject</p>
            <p className="text-sm text-gray-700">{contact.subject}</p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-xs uppercase text-gray-400 mb-2">Message</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {contact.message}
          </p>
        </div>

        {/* User Information (if userId exists) */}
        {userInfo && (
          <div className="mb-6">
            <p className="text-xs uppercase text-gray-400 mb-2">User Account</p>
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

        {/* Timestamps */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-gray-400">Created</p>
            <p className="text-sm text-gray-700">
              {formatDateTimeWithTime(contact.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Updated</p>
            <p className="text-sm text-gray-700">
              {formatDateTimeWithTime(contact.updatedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Status</p>
            <p className="text-sm text-gray-700">
              <span className={getStatusBadgeClass(contact.status)}>
                {getStatusDisplayName(contact.status)}
              </span>
            </p>
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
