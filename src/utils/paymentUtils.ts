/**
 * Payment Utility Functions
 * 
 * Utility functions for formatting and validating payment data.
 */

import type { IPayment, PaymentStatus, PaymentMethod, PaymentType } from '../types/api.types';

/**
 * Format payment status for display
 * Converts status enum to human-readable string
 * 
 * @param status - Payment status enum value
 * @returns Formatted status string
 */
export const formatPaymentStatus = (status: PaymentStatus | string): string => {
  const statusMap: Record<string, string> = {
    PENDING: 'Pending',
    SUCCESS: 'Success',
    FAILED: 'Failed',
    pending: 'Pending',
    success: 'Success',
    failed: 'Failed',
    completed: 'Success',
    COMPLETED: 'Success',
  };
  return statusMap[status] || String(status);
};

/**
 * Get badge variant for payment status
 * Returns appropriate Tailwind CSS badge class variant
 * 
 * @param status - Payment status enum value
 * @returns Badge variant class name
 */
export const getPaymentStatusVariant = (status: PaymentStatus | string): 'default' | 'success' | 'error' | 'warning' | 'soft' => {
  const statusLower = String(status).toLowerCase();
  if (statusLower === 'success' || statusLower === 'completed') return 'success';
  if (statusLower === 'failed') return 'error';
  if (statusLower === 'pending') return 'warning';
  return 'default';
};

/**
 * Format payment method for display
 * Converts method enum to human-readable string
 * 
 * @param method - Payment method enum value
 * @returns Formatted method string
 */
export const formatPaymentMethod = (method: PaymentMethod | string): string => {
  const methodMap: Record<string, string> = {
    MPESA: 'M-Pesa',
    mpesa: 'M-Pesa',
    CARD: 'Card',
    card: 'Card',
    PAYSTACK: 'Card',
    paystack: 'Card',
    CASH: 'Cash',
    cash: 'Cash',
  };
  return methodMap[method] || String(method);
};

/**
 * Format payment type for display
 * Converts type enum to human-readable string
 * 
 * @param type - Payment type enum value
 * @returns Formatted type string
 */
export const formatPaymentType = (type: PaymentType | string): string => {
  const typeMap: Record<string, string> = {
    BOOKING_FEE: 'Booking Fee',
    booking_fee: 'Booking Fee',
    FULL_PAYMENT: 'Full Payment',
    full_payment: 'Full Payment',
    service_payment: 'Service Payment',
    SERVICE_PAYMENT: 'Service Payment',
  };
  return typeMap[type] || String(type);
};

/**
 * Format currency amount for display
 * Formats number as currency with currency code
 * 
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'KES')
 * @returns Formatted currency string (e.g., "KES 1,200.00")
 */
export const formatCurrency = (amount: number | string | null | undefined, currency: string = 'KES'): string => {
  if (amount === null || amount === undefined) return `—`;
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `—`;
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

/**
 * Get customer name from payment
 * Extracts customer name from payment customerId (can be string or populated object)
 * 
 * @param payment - Payment object
 * @returns Customer name string or "Unknown"
 */
export const getPaymentCustomerName = (payment: IPayment | null | undefined): string => {
  if (!payment) return 'Unknown';
  if (typeof payment.customerId === 'object' && payment.customerId !== null) {
    const customer = payment.customerId as any;
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown';
  }
  return 'Unknown';
};

/**
 * Get appointment ID from payment
 * Extracts appointment ID from payment appointmentId (can be string or populated object)
 * 
 * @param payment - Payment object
 * @returns Appointment ID string or null
 */
export const getPaymentAppointmentId = (payment: IPayment | null | undefined): string | null => {
  if (!payment || !payment.appointmentId) return null;
  if (typeof payment.appointmentId === 'string') return payment.appointmentId;
  if (typeof payment.appointmentId === 'object' && payment.appointmentId !== null) {
    return (payment.appointmentId as any)._id || null;
  }
  return null;
};

/**
 * Get M-Pesa checkout request ID from payment
 * Extracts checkout request ID from payment processorRefs
 * 
 * @param payment - Payment object
 * @returns Checkout request ID string or null
 */
export const getMpesaCheckoutId = (payment: IPayment | null | undefined): string | null => {
  if (!payment || !payment.processorRefs) return null;
  return payment.processorRefs.mpesaCheckoutRequestId || payment.processorRefs.daraja?.checkoutRequestId || null;
};

/**
 * Get Paystack reference from payment
 * Extracts reference from payment processorRefs
 * 
 * @param payment - Payment object
 * @returns Paystack reference string or null
 */
export const getPaystackReference = (payment: IPayment | null | undefined): string | null => {
  if (!payment || !payment.processorRefs) return null;
  return payment.processorRefs.paystackReference || payment.processorRefs.paystack?.reference || null;
};

/**
 * Check if payment is M-Pesa
 * Determines if payment method is M-Pesa
 * 
 * @param payment - Payment object
 * @returns True if payment method is M-Pesa
 */
export const isMpesaPayment = (payment: IPayment | null | undefined): boolean => {
  if (!payment) return false;
  const method = String(payment.method).toLowerCase();
  return method === 'mpesa';
};

/**
 * Check if payment is Paystack/Card
 * Determines if payment method is Paystack/Card
 * 
 * @param payment - Payment object
 * @returns True if payment method is Paystack/Card
 */
export const isPaystackPayment = (payment: IPayment | null | undefined): boolean => {
  if (!payment) return false;
  const method = String(payment.method).toLowerCase();
  return method === 'card' || method === 'paystack';
};
