import type { IContact, ContactStatus } from '../types/api.types';

/**
 * Format ISO date string to readable date format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

/**
 * Format ISO date string to readable date and time format
 * @param dateString - ISO date string
 * @returns Formatted date and time string (e.g., "Jan 15, 2025 10:30 AM")
 */
export const formatDateTimeWithTime = (dateString: string): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
};

/**
 * Get badge class based on contact status
 * @param status - Contact status
 * @returns Tailwind CSS badge class
 */
export const getStatusBadgeClass = (status: ContactStatus): string => {
  switch (status) {
    case 'new':
      return 'badge badge-soft bg-blue-100 text-blue-700';
    case 'read':
      return 'badge badge-soft';
    case 'replied':
      return 'badge badge-success';
    case 'archived':
      return 'badge badge-soft bg-gray-100 text-gray-600';
    default:
      return 'badge badge-soft';
  }
};

/**
 * Get display name for contact status
 * @param status - Contact status
 * @returns Display name
 */
export const getStatusDisplayName = (status: ContactStatus): string => {
  switch (status) {
    case 'new':
      return 'New';
    case 'read':
      return 'Read';
    case 'replied':
      return 'Replied';
    case 'archived':
      return 'Archived';
    default:
      return status;
  }
};

/**
 * Get recipient email for contact (user email if userId exists, otherwise contact email)
 * @param contact - Contact object
 * @returns Recipient email address
 */
export const getRecipientEmail = (contact: IContact): string => {
  if (contact.userId && typeof contact.userId === 'object' && contact.userId.email) {
    return contact.userId.email;
  }
  return contact.email;
};
