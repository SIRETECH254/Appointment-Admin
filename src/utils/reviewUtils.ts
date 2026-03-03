import type { IReview, IUser, IAppointment, IAppointmentService } from '../types/api.types';

/**
 * Format ISO date string into a readable date format
 * Returns "—" if value is invalid or missing
 * 
 * @param value - ISO date string to format
 * @returns Formatted date string (e.g., "Jan 15, 2024") or "—" if invalid
 */
export const formatReviewDate = (value?: string): string => {
  if (!value) return '—';
  
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(date);
};

/**
 * Format ISO date string into a full date and time format
 * Returns "—" if value is invalid or missing
 * 
 * @param value - ISO date string to format
 * @returns Formatted date and time string (e.g., "Jan 15, 2024, 10:37 AM") or "—" if invalid
 */
export const formatReviewDateTime = (value?: string): string => {
  if (!value) return '—';
  
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

/**
 * Extract user name from review (handle both string ID and populated IUser object)
 * Returns "Unknown User" if user info is not available
 * 
 * @param review - Review object with userId (string or IUser)
 * @returns User name string or "Unknown User" if not available
 */
export const getUserName = (review: IReview): string => {
  if (!review.userId) return 'Unknown User';
  
  // If userId is a populated IUser object
  if (typeof review.userId === 'object' && 'firstName' in review.userId) {
    const user = review.userId as IUser;
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
  }
  
  // If userId is just a string ID, we can't get the name without fetching
  return 'Unknown User';
};

/**
 * Get user initials for avatar fallback
 * Returns "U" if no user info is available
 * 
 * @param review - Review object with userId (string or IUser)
 * @returns Initials string (e.g., "JD" for John Doe) or "U" if no name
 */
export const getUserInitials = (review: IReview): string => {
  if (!review.userId) return 'U';
  
  // If userId is a populated IUser object
  if (typeof review.userId === 'object' && 'firstName' in review.userId) {
    const user = review.userId as IUser;
    const letters = [user.firstName, user.lastName]
      .filter(Boolean)
      .map((value: string) => value[0]?.toUpperCase())
      .join('');
    return letters || 'U';
  }
  
  // If userId is just a string ID, return default
  return 'U';
};

/**
 * Extract staff name from review's appointment (handle populated vs ID)
 * Returns "Unknown Staff" if staff info is not available
 * 
 * @param review - Review object with appointmentId (string or IAppointment)
 * @returns Staff name string or "Unknown Staff" if not available
 */
export const getStaffName = (review: IReview): string => {
  if (!review.appointmentId) return 'Unknown Staff';
  
  // If appointmentId is a populated IAppointment object
  if (typeof review.appointmentId === 'object' && 'staffId' in review.appointmentId) {
    const appointment = review.appointmentId as IAppointment;
    if (!appointment.staffId) return 'Unknown Staff';
    
    // If staffId is a populated IUser object
    if (typeof appointment.staffId === 'object' && 'firstName' in appointment.staffId) {
      const staff = appointment.staffId as IUser;
      const firstName = staff.firstName || '';
      const lastName = staff.lastName || '';
      return `${firstName} ${lastName}`.trim() || 'Unknown Staff';
    }
  }
  
  return 'Unknown Staff';
};

/**
 * Extract service names from review's appointment
 * Returns empty array if services are not available
 * 
 * @param review - Review object with appointmentId (string or IAppointment)
 * @returns Array of service names
 */
export const getServiceNames = (review: IReview): string[] => {
  if (!review.appointmentId) return [];
  
  // If appointmentId is a populated IAppointment object
  if (typeof review.appointmentId === 'object' && 'services' in review.appointmentId) {
    const appointment = review.appointmentId as IAppointment;
    if (!appointment.services || !Array.isArray(appointment.services)) return [];
    
    // If services are populated IAppointmentService objects
    if (appointment.services.length > 0 && typeof appointment.services[0] === 'object' && 'name' in appointment.services[0]) {
      return (appointment.services as IAppointmentService[]).map(service => service.name);
    }
  }
  
  return [];
};

/**
 * Format review status for display
 * 
 * @param status - Review status (PENDING, APPROVED, REJECTED)
 * @returns Formatted status string
 */
export const formatReviewStatus = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status;
  }
};

/**
 * Format appointment date from review's appointment
 * Returns "—" if appointment info is not available
 * 
 * @param review - Review object with appointmentId (string or IAppointment)
 * @returns Formatted date string or "—" if not available
 */
export const getAppointmentDate = (review: IReview): string => {
  if (!review.appointmentId) return '—';
  
  // If appointmentId is a populated IAppointment object
  if (typeof review.appointmentId === 'object' && 'startTime' in review.appointmentId) {
    const appointment = review.appointmentId as IAppointment;
    if (appointment.startTime) {
      return formatReviewDate(typeof appointment.startTime === 'string' ? appointment.startTime : appointment.startTime.toISOString());
    }
  }
  
  return '—';
};
