import type { IRole } from '../types/api.types';

/**
 * Format ISO timestamps into a human-friendly date format
 * Returns "—" if value is invalid or missing
 * 
 * @param value - ISO date string to format
 * @returns Formatted date string or "—" if invalid
 */
export const formatDateTime = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(date);
};

/**
 * Format ISO timestamps with time included
 * Returns "—" if value is invalid or missing
 * 
 * @param value - ISO date string to format
 * @returns Formatted date and time string or "—" if invalid
 */
export const formatDateTimeWithTime = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

/**
 * Extract role initials from role name or displayName for avatar fallback
 * Returns first two letters of the role name/displayName, or "R" if no name available
 * 
 * @param role - Role object with name and displayName
 * @returns Initials string (e.g., "AD" for Admin, "ST" for Staff) or "R" if no name
 */
export const getRoleInitials = (role: IRole): string => {
  const name = role.displayName || role.name || '';
  if (!name) return 'R';
  
  // Get first two characters, handling multi-word names
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    // Two words: use first letter of each
    return (words[0][0] + words[1][0]).toUpperCase().slice(0, 2);
  } else {
    // Single word: use first two letters
    return name.slice(0, 2).toUpperCase();
  }
};

/**
 * Format permissions array for display
 * Returns "*" if array contains "*" (all permissions), 
 * comma-separated list if few permissions, 
 * or count badge if many permissions
 * 
 * @param permissions - Array of permission strings
 * @returns Formatted permissions string for display
 */
export const formatPermissions = (permissions: string[]): string => {
  if (!permissions || permissions.length === 0) {
    return 'No permissions';
  }
  
  // Check if all permissions (admin role)
  if (permissions.includes('*') || permissions.length === 1 && permissions[0] === '*') {
    return '*';
  }
  
  // If few permissions, show comma-separated list
  if (permissions.length <= 5) {
    return permissions.join(', ');
  }
  
  // If many permissions, show count
  return `${permissions.length} permissions`;
};
