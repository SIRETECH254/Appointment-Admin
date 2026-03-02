import type { IBreak, IUser } from '../types/api.types';

/**
 * Format HH:MM time string into a human-friendly time format
 * Returns "—" if value is invalid or missing
 * 
 * @param value - HH:MM format time string (e.g., "13:00")
 * @returns Formatted time string (e.g., "1:00 PM") or "—" if invalid
 */
export const formatBreakDateTime = (value?: string): string => {
  if (!value) return '—';
  
  // Handle HH:MM format
  const timeMatch = value.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes} ${period}`;
  }
  
  // Fallback: try to parse as ISO date string for backward compatibility
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('en-US', {
      timeStyle: 'short',
    }).format(date);
  }
  
  return '—';
};

/**
 * Format start and end times as a readable time range
 * Returns "—" if values are invalid or missing
 * 
 * @param startTime - HH:MM format time string (e.g., "13:00")
 * @param endTime - HH:MM format time string (e.g., "14:00")
 * @returns Formatted time range string (e.g., "1:00 PM - 2:00 PM") or "—" if invalid
 */
export const formatBreakTimeRange = (startTime?: string, endTime?: string): string => {
  if (!startTime || !endTime) return '—';
  
  const startFormatted = formatBreakDateTime(startTime);
  const endFormatted = formatBreakDateTime(endTime);
  
  if (startFormatted === '—' || endFormatted === '—') return '—';
  
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Extract staff name from break (handle both string ID and populated IUser object)
 * Returns "Unknown Staff" if staff info is not available
 * 
 * @param break - Break object with staffId (string or IUser)
 * @returns Staff name string or "Unknown Staff" if not available
 */
export const getStaffName = (breakItem: IBreak): string => {
  if (!breakItem.staffId) return 'Unknown Staff';
  
  // If staffId is a populated IUser object
  if (typeof breakItem.staffId === 'object' && 'firstName' in breakItem.staffId) {
    const staff = breakItem.staffId as IUser;
    const firstName = staff.firstName || '';
    const lastName = staff.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Staff';
  }
  
  // If staffId is just a string ID, we can't get the name without fetching
  // Return a placeholder or fetch separately
  return 'Unknown Staff';
};

/**
 * Get staff initials for avatar fallback
 * Returns "U" if no staff info is available
 * 
 * @param break - Break object with staffId (string or IUser)
 * @returns Initials string (e.g., "JD" for John Doe) or "U" if no name
 */
export const getStaffInitials = (breakItem: IBreak): string => {
  if (!breakItem.staffId) return 'U';
  
  // If staffId is a populated IUser object
  if (typeof breakItem.staffId === 'object' && 'firstName' in breakItem.staffId) {
    const staff = breakItem.staffId as IUser;
    const letters = [staff.firstName, staff.lastName]
      .filter(Boolean)
      .map((value: string) => value[0]?.toUpperCase())
      .join('');
    return letters || 'U';
  }
  
  // If staffId is just a string ID, return default
  return 'U';
};

/**
 * Format HH:MM time string to time input format (HH:MM)
 * Used for pre-populating time inputs in forms
 * 
 * @param timeString - HH:MM format time string (e.g., "13:00")
 * @returns Formatted string in time input format (HH:MM) or empty string if invalid
 */
export const formatTimeInput = (timeString?: string): string => {
  if (!timeString) return '';
  
  // Handle HH:MM format directly
  const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2];
    return `${hours}:${minutes}`;
  }
  
  // Fallback: try to parse as ISO date string and extract time
  const date = new Date(timeString);
  if (!Number.isNaN(date.getTime())) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  return '';
};

/**
 * Compare two time strings in HH:MM format
 * Returns true if startTime is before endTime
 * 
 * @param startTime - HH:MM format time string (e.g., "13:00")
 * @param endTime - HH:MM format time string (e.g., "14:00")
 * @returns true if startTime < endTime, false otherwise
 */
export const isTimeBefore = (startTime: string, endTime: string): boolean => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  
  return startTotal < endTotal;
};

/**
 * Format ISO date string into a full date and time format
 * Returns "—" if value is invalid or missing
 * 
 * @param value - ISO date string to format
 * @returns Formatted date and time string (e.g., "Jan 15, 2024, 10:37 AM") or "—" if invalid
 */
export const formatFullDateTime = (value?: string): string => {
  if (!value) return '—';
  
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
