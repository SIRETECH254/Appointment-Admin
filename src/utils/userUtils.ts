import { MdAdminPanelSettings, MdWork, MdPerson } from 'react-icons/md';
import type { IUser, IRole } from '../types/api.types';

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
 * Extract user initials from first and last name for avatar fallback
 * Returns "U" if no name is available
 * 
 * @param user - User object with firstName and lastName
 * @returns Initials string (e.g., "JD" for John Doe) or "U" if no name
 */
export const getUserInitials = (user: IUser): string => {
  const letters = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((value: string) => value[0]?.toUpperCase())
    .join('');
  return letters || 'U';
};

/**
 * Get the primary role display name from user's roles array
 * Returns "User" if no roles are assigned
 * 
 * @param user - User object with roles array
 * @returns Role display name or "User" if no roles
 */
export const getRoleDisplayName = (user: IUser): string => {
  if (!user.roles || user.roles.length === 0) return 'User';
  return user.roles[0].displayName || user.roles[0].name || 'User';
};

/**
 * Get styling for a role badge based on the role name
 * @param role - The role object
 * @returns An object with badge class and icon component
 */
export const getRoleStyle = (role: IRole) => {
  const roleName = role.name.toLowerCase();
  switch (roleName) {
    case 'admin':
      return {
        badgeClass: 'bg-red-100 text-red-700',
        icon: MdAdminPanelSettings,
      };
    case 'staff':
      return {
        badgeClass: 'bg-blue-100 text-blue-700',
        icon: MdWork,
      };
    case 'customer':
      return {
        badgeClass: 'bg-green-100 text-green-700',
        icon: MdPerson,
      };
    default:
      return {
        badgeClass: 'bg-gray-100 text-gray-700',
        icon: MdPerson,
      };
  }
};
