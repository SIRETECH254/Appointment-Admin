import type { IBreak, IUser } from '../types/api.types';

/**
 * Format ISO timestamps into a human-friendly date-time format
 * Returns "—" if value is invalid or missing
 * 
 * @param value - ISO date string to format
 * @returns Formatted date and time string or "—" if invalid
 */
export const formatBreakDateTime = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

/**
 * Format start and end times as a readable time range
 * Returns "—" if values are invalid or missing
 * 
 * @param startTime - ISO date string for start time
 * @param endTime - ISO date string for end time
 * @returns Formatted time range string or "—" if invalid
 */
export const formatBreakTimeRange = (startTime?: string, endTime?: string): string => {
  if (!startTime || !endTime) return '—';
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—';
  
  const startFormatted = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(start);
  
  const endFormatted = new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
  }).format(end);
  
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
 * Format Date object to datetime-local input format (YYYY-MM-DDTHH:mm)
 * Used for pre-populating datetime-local inputs in forms
 * 
 * @param date - Date object to format
 * @returns Formatted string in datetime-local format
 */
export const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
