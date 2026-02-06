/**
 * Appointment Utility Functions
 * 
 * Utility functions for formatting and validating appointment data.
 */

import type { IAppointment, AppointmentStatus } from '../types/api.types';

/**
 * Format appointment status for display
 * Converts status enum to human-readable string
 * 
 * @param status - Appointment status enum value
 * @returns Formatted status string
 */
export const formatAppointmentStatus = (status: AppointmentStatus | string): string => {
  const statusMap: Record<string, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  };
  return statusMap[status] || String(status);
};

/**
 * Get badge variant for appointment status
 * Returns appropriate Tailwind CSS badge class variant
 * 
 * @param status - Appointment status enum value
 * @returns Badge variant class name
 */
export const getAppointmentStatusVariant = (status: AppointmentStatus | string): 'default' | 'success' | 'error' | 'warning' | 'soft' => {
  const statusLower = String(status).toLowerCase();
  if (statusLower === 'completed') return 'success';
  if (statusLower === 'confirmed') return 'soft';
  if (statusLower === 'cancelled' || statusLower === 'no_show') return 'error';
  if (statusLower === 'pending') return 'warning';
  return 'default';
};

/**
 * Format appointment date and time for display
 * Formats ISO date string to readable date/time format
 * 
 * @param dateString - ISO date string
 * @returns Formatted date/time string (e.g., "January 25, 2025, 9:00 AM")
 */
export const formatAppointmentDateTime = (dateString: string | Date): string => {
  if (!dateString) return '—';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '—';
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Format appointment date range for display
 * Formats start and end times as a range
 * 
 * @param startTime - Appointment start time
 * @param endTime - Appointment end time
 * @returns Formatted date range string (e.g., "Jan 25, 9:00 AM - 10:30 AM")
 */
export const formatAppointmentDateRange = (startTime: string | Date, endTime: string | Date): string => {
  if (!startTime || !endTime) return '—';
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '—';
  
  const isSameDay = start.toDateString() === end.toDateString();
  
  if (isSameDay) {
    const dateStr = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(start);
    
    const startTimeStr = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(start);
    
    const endTimeStr = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(end);
    
    return `${dateStr}, ${startTimeStr} - ${endTimeStr}`;
  }
  
  // Different days - show full range
  return `${formatAppointmentDateTime(start)} - ${formatAppointmentDateTime(end)}`;
};

/**
 * Check if appointment can be rescheduled
 * Only CONFIRMED appointments can be rescheduled
 * 
 * @param appointment - Appointment object
 * @returns True if appointment can be rescheduled
 */
export const canRescheduleAppointment = (appointment: IAppointment | null | undefined): boolean => {
  if (!appointment) return false;
  const status = String(appointment.status).toUpperCase();
  return status === 'CONFIRMED';
};

/**
 * Check if appointment can be cancelled
 * Only CONFIRMED appointments can be cancelled, and must be at least 2 hours before start time
 * 
 * @param appointment - Appointment object
 * @returns True if appointment can be cancelled
 */
export const canCancelAppointment = (appointment: IAppointment | null | undefined): boolean => {
  if (!appointment) return false;
  const status = String(appointment.status).toUpperCase();
  if (status !== 'CONFIRMED') return false;
  
  const startTime = typeof appointment.startTime === 'string' 
    ? new Date(appointment.startTime) 
    : appointment.startTime;
  const now = new Date();
  const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilStart >= 2;
};

/**
 * Check if appointment can be checked in
 * Only CONFIRMED appointments can be checked in, and only on the same day as start time
 * 
 * @param appointment - Appointment object
 * @returns True if appointment can be checked in
 */
export const canCheckInAppointment = (appointment: IAppointment | null | undefined): boolean => {
  if (!appointment) return false;
  const status = String(appointment.status).toUpperCase();
  if (status !== 'CONFIRMED') return false;
  
  // Check if already checked in
  if (appointment.checkedInAt) return false;
  
  const startTime = typeof appointment.startTime === 'string' 
    ? new Date(appointment.startTime) 
    : appointment.startTime;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointmentDate = new Date(startTime);
  appointmentDate.setHours(0, 0, 0, 0);
  
  return today.getTime() === appointmentDate.getTime();
};

/**
 * Get customer name from appointment
 * Extracts customer name from appointment customerId (can be string or populated object)
 * 
 * @param appointment - Appointment object
 * @returns Customer name string or "Unknown"
 */
export const getAppointmentCustomerName = (appointment: IAppointment | null | undefined): string => {
  if (!appointment) return 'Unknown';
  if (typeof appointment.customerId === 'object' && appointment.customerId !== null) {
    const customer = appointment.customerId as any;
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown';
  }
  return 'Unknown';
};

/**
 * Get staff name from appointment
 * Extracts staff name from appointment staffId (can be string or populated object)
 * 
 * @param appointment - Appointment object
 * @returns Staff name string or "Unknown"
 */
export const getAppointmentStaffName = (appointment: IAppointment | null | undefined): string => {
  if (!appointment) return 'Unknown';
  if (typeof appointment.staffId === 'object' && appointment.staffId !== null) {
    const staff = appointment.staffId as any;
    return `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Unknown';
  }
  return 'Unknown';
};

/**
 * Get services display string from appointment
 * Formats services array as comma-separated list or "N services"
 * 
 * @param appointment - Appointment object
 * @returns Services display string
 */
export const getAppointmentServicesDisplay = (appointment: IAppointment | null | undefined): string => {
  if (!appointment || !appointment.services || appointment.services.length === 0) return 'No services';
  
  if (appointment.services.length === 1) {
    const service = appointment.services[0];
    if (typeof service === 'object' && service !== null) {
      return (service as any).name || 'Service';
    }
    return 'Service';
  }
  
  // Multiple services - show count or names
  const serviceNames = appointment.services
    .map(service => {
      if (typeof service === 'object' && service !== null) {
        return (service as any).name;
      }
      return null;
    })
    .filter(Boolean);
  
  if (serviceNames.length > 0 && serviceNames.length <= 3) {
    return serviceNames.join(', ');
  }
  
  return `${appointment.services.length} services`;
};
