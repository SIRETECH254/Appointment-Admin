/**
 * Utility functions for formatting store configuration values
 */

/**
 * Converts minutes to a readable format
 * @param minutes - Number of minutes
 * @returns Formatted string (e.g., "60 minutes", "1 hour", "2 hours 30 minutes")
 */
export const formatMinutes = (minutes: number): string => {
  if (minutes < 0) return '—';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

/**
 * Formats reminder times array for display
 * @param times - Array of minutes before appointment
 * @returns Formatted string (e.g., "1 day, 2 hours, 30 minutes before")
 */
export const formatReminderTimes = (times: number[]): string => {
  if (!times || times.length === 0) return '—';
  return times.map(t => formatMinutes(t)).join(', ');
};

/**
 * Parses reminder times from comma-separated string input
 * @param input - Comma-separated string of numbers
 * @returns Array of non-negative numbers
 */
export const parseReminderTimes = (input: string): number[] => {
  if (!input.trim()) return [];
  return input
    .split(',')
    .map(item => Number(item.trim()))
    .filter(num => !Number.isNaN(num) && num >= 0);
};

/**
 * Formats date time for display
 * @param value - ISO date string
 * @returns Formatted date string or "—" if invalid
 */
export const formatDateTime = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
