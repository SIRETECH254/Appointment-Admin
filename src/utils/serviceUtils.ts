/**
 * Service utility functions for formatting and displaying service-related data
 */

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
 * Format currency amounts for display
 * Defaults to KES (Kenyan Shilling) currency
 * 
 * @param amount - Numeric amount to format
 * @param currency - Currency code (default: "KES")
 * @returns Formatted currency string (e.g., "KES 500" or "$50.00")
 */
export const formatPrice = (amount: number, currency: string = 'KES'): string => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—';
  
  // For KES, use simple format without decimals
  if (currency === 'KES') {
    return `KES ${amount.toLocaleString('en-US')}`;
  }
  
  // For other currencies, use standard currency formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format duration in minutes to a human-readable format
 * Converts minutes to hours and minutes when appropriate
 * 
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "30 min" or "1h 30min")
 */
export const formatDuration = (minutes: number): string => {
  if (typeof minutes !== 'number' || Number.isNaN(minutes) || minutes < 0) {
    return '—';
  }
  
  // If less than 60 minutes, return as minutes
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  // Calculate hours and remaining minutes
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  // If no remaining minutes, return just hours
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  // Return hours and minutes
  return `${hours}h ${remainingMinutes}min`;
};

