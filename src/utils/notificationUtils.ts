import type { INotification, NotificationCategory, NotificationType } from '../types/api.types';

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
 * Get badge class based on notification category
 * @param category - Notification category
 * @returns Tailwind CSS badge class
 */
export const getCategoryBadgeClass = (category: NotificationCategory): string => {
  switch (category) {
    case 'general':
      return 'badge badge-soft';
    case 'appointment':
      return 'badge badge-soft bg-blue-100 text-blue-700';
    case 'payment':
      return 'badge badge-success';
    default:
      return 'badge badge-soft';
  }
};

/**
 * Get display name for notification category
 * @param category - Notification category
 * @returns Display name
 */
export const getCategoryDisplayName = (category: NotificationCategory): string => {
  switch (category) {
    case 'general':
      return 'General';
    case 'appointment':
      return 'Appointment';
    case 'payment':
      return 'Payment';
    default:
      return category;
  }
};

/**
 * Get display name for notification type
 * @param type - Notification type
 * @returns Display name
 */
export const getTypeDisplayName = (type: NotificationType): string => {
  switch (type) {
    case 'email':
      return 'Email';
    case 'sms':
      return 'SMS';
    case 'in_app':
      return 'In-app';
    default:
      return type;
  }
};

/**
 * Check if notification is unread
 * @param notification - Notification object
 * @returns True if notification is unread
 */
export const isNotificationUnread = (notification: INotification): boolean => {
  return !notification.readAt || notification.isUnread === true;
};

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  } catch {
    return '—';
  }
};
