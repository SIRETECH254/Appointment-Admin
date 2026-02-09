// ============================================
// Common Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ============================================
// Auth Types
// ============================================

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}

export interface ResendOTPPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface TokenResponse {
  accessToken: string;
}

// ============================================
// User Types
// ============================================

export interface IWorkingHours {
  monday: { start: string; end: string }[];
  tuesday: { start: string; end: string }[];
  wednesday: { start: string; end: string }[];
  thursday: { start: string; end: string }[];
  friday: { start: string; end: string }[];
  saturday: { start: string; end: string }[];
  sunday: { start: string; end: string }[];
}

export interface INotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  appointmentReminders: boolean;
  promotions: boolean;
}

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  roles: IRole[];
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  workingHours?: IWorkingHours;
  assignedServices?: string[];
  notificationPreferences?: INotificationPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateNotificationPreferencesPayload {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  appointmentReminders?: boolean;
  promotions?: boolean;
}

export interface AdminCreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}

export interface SetUserAdminPayload {
  isAdmin: boolean;
}

export interface AssignRolePayload {
  roleId: string;
}

export interface GetCustomersParams extends PaginationParams {
  status?: 'active' | 'inactive';
}

export interface GetUsersParams extends PaginationParams {
  role?: string;
  status?: 'active' | 'inactive';
}

// ============================================
// Role Types
// ============================================

export interface IRole {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRolePayload {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isActive?: boolean;
}

export interface UpdateRolePayload {
  name?: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

// ============================================
// Service Types
// ============================================

export interface IService {
  _id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  fullPrice: number;
  depositAmount?: number;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  duration: number;
  fullPrice: number;
  depositAmount?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateServicePayload {
  name?: string;
  description?: string;
  duration?: number;
  fullPrice?: number;
  depositAmount?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AssignServicesToStaffPayload {
  serviceIds: string[];
}

export interface GetServicesParams extends PaginationParams {
  status?: 'active' | 'inactive';
}

// ============================================
// Appointment Types
// ============================================

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'pending' // Legacy support
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

// Service object when populated from appointment.services array
export interface IAppointmentService {
  _id: string;
  name: string;
  duration: number;
  fullPrice: number;
}

export interface IAppointment {
  _id: string;
  customerId: string | IUser;
  staffId: string | IUser;
  services: string[] | IAppointmentService[]; // Array of service IDs or populated service objects
  startTime: string | Date;
  endTime: string | Date;
  status: AppointmentStatus;
  bookingFeeAmount: number;
  remainingAmount: number;
  checkedInAt?: string | Date;
  actualEndTime?: string | Date;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateAppointmentPayload {
  staffId: string;
  services: string[]; // Array of service IDs
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  notes?: string;
}

export interface ConfirmAppointmentPayload {
  method: 'MPESA' | 'CARD';
  phone?: string; // Required for MPESA
  email?: string;  // Required for CARD
}

export interface RescheduleAppointmentPayload {
  startTime: string;
  endTime: string;
}

export interface CancelAppointmentPayload {
  reason?: string;
}

export interface GetAppointmentsParams extends PaginationParams {
  status?: AppointmentStatus;
  staffId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetMyAppointmentsParams extends PaginationParams {
  status?: AppointmentStatus;
  upcoming?: boolean;
}

// ============================================
// Availability Types
// ============================================

export interface ITimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface GetSlotsParams {
  staffId: string;
  serviceId: string | string[]; // Support single or multiple serviceIds
  date: string; // YYYY-MM-DD
}

export interface GetSlotsResponse {
  slots: ITimeSlot[];
}

export interface GetDayAvailabilityParams {
  staffId?: string;
  date: string; // YYYY-MM-DD
}

export interface GetDayAvailabilityResponse {
  date: string;
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
}

// ============================================
// Break Types
// ============================================

export type RecurringFrequency = 'daily' | 'weekly';

export interface IRecurringPattern {
  frequency: RecurringFrequency;
  daysOfWeek?: number[]; // 0-6
  endDate?: string;
}

export interface IBreak {
  _id: string;
  staffId: string | IUser;
  startTime: string;
  endTime: string;
  reason?: string;
  isRecurring: boolean;
  recurringPattern?: IRecurringPattern;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBreakPayload {
  staffId: string;
  startTime: string;
  endTime: string;
  reason?: string;
  isRecurring?: boolean;
  recurringPattern?: IRecurringPattern;
}

export interface UpdateBreakPayload {
  staffId?: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  isRecurring?: boolean;
  recurringPattern?: IRecurringPattern;
}

export interface GetBreaksParams extends PaginationParams {
  staffId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// Payment Types
// ============================================

export type PaymentMethod = 'MPESA' | 'CARD' | 'CASH';
export type PaymentType = 'BOOKING_FEE' | 'FULL_PAYMENT';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface IProcessorRefs {
  daraja?: {
    merchantRequestId?: string;
    checkoutRequestId?: string;
  };
  paystack?: {
    reference?: string;
  };
  // Legacy fields for backward compatibility
  mpesaReceiptNumber?: string;
  mpesaCheckoutRequestId?: string;
  paystackReference?: string;
  paystackTransactionId?: string;
}

export interface IPayment {
  _id: string;
  paymentNumber?: string;
  appointmentId?: string | IAppointment; // Optional - can be null for service-only payments
  customerId?: string | IUser;
  amount: number;
  currency?: string; // Default: 'KES'
  method: PaymentMethod;
  type: PaymentType;
  status: PaymentStatus;
  transactionRef?: string;
  processorRefs?: IProcessorRefs;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InitiatePaymentPayload {
  services: string[]; // Array of service IDs (required, min 1)
  method: PaymentMethod;
  phone?: string; // Required for MPESA
  email?: string; // Required for CARD
}

export interface InitiatePaymentResponse {
  payment: IPayment;
  gateway: {
    checkoutRequestId?: string;
    merchantRequestId?: string;
    authorizationUrl?: string;
    reference?: string;
  };
}

export interface ServicePaymentPayload {
  appointmentId: string;
  method: PaymentMethod;
  phone?: string; // Required for MPESA
  email?: string; // Required for CARD
  // Note: amount is automatically set to appointment.remainingAmount by backend
}

export interface GetPaymentsParams extends PaginationParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
  type?: PaymentType;
  startDate?: string;
  endDate?: string;
}

// M-Pesa Status Query Types
export interface QueryMpesaStatusParams {
  checkoutRequestId: string;
}

export interface QueryMpesaStatusResponse {
  ok: boolean;
  resultCode?: number | string;
  resultDesc?: string;
  raw?: any;
  error?: string;
  details?: string;
}

// ============================================
// Notification Types
// ============================================

export type NotificationType = 'email' | 'sms' | 'in_app';
export type NotificationCategory = 'general' | 'appointment' | 'payment';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface INotificationAction {
  id: string;
  label: string;
  type: 'api' | 'navigate' | 'modal' | 'confirm';
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  payload?: Record<string, any>;
  route?: string;
  modal?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface INotificationContext {
  resourceId: string;
  resourceType: string;
  additionalData?: Record<string, any>;
}

export interface INotification {
  _id: string;
  recipient: string | IUser;
  recipientModel?: 'User';
  type: NotificationType;
  category: NotificationCategory;
  subject: string;
  message: string;
  status: NotificationStatus;
  sentAt?: string;
  readAt?: string;
  metadata?: Record<string, any>;
  actions?: INotificationAction[];
  context?: INotificationContext;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  // Computed virtual field from backend
  isUnread?: boolean;
}

export interface SendNotificationPayload {
  recipient: string; // recipient ID
  type: NotificationType;
  category: NotificationCategory;
  subject: string;
  message: string;
  metadata?: Record<string, any>;
  actions?: INotificationAction[];
  context?: INotificationContext;
  expiresAt?: string;
}

export interface SendBulkNotificationPayload {
  recipients: string[]; // array of recipient IDs
  type: NotificationType;
  category: NotificationCategory;
  subject: string;
  message: string;
}

export interface GetNotificationsParams extends PaginationParams {
  category?: NotificationCategory;
  type?: NotificationType;
  status?: NotificationStatus | 'read' | 'unread';
}

export interface NotificationPaginationResponse {
  notifications: INotification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface UnreadNotificationsResponse {
  notifications: INotification[];
  count: number;
}

// ============================================
// Contact Types
// ============================================

export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';

export interface IContact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  userId?: string | IUser;
  status: ContactStatus;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string | IUser;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface UpdateContactStatusPayload {
  status: ContactStatus;
}

export interface ReplyToContactPayload {
  reply: string;
}

export interface GetContactsParams extends PaginationParams {
  status?: ContactStatus;
}

// ============================================
// Store Configuration Types
// ============================================

export type AppointmentFeeType = 'percentage' | 'fixed';

export interface IBusinessHoursDay {
  open: string; // HH:mm
  close: string;
  isOpen: boolean;
}

export interface IBusinessHours {
  monday: IBusinessHoursDay;
  tuesday: IBusinessHoursDay;
  wednesday: IBusinessHoursDay;
  thursday: IBusinessHoursDay;
  friday: IBusinessHoursDay;
  saturday: IBusinessHoursDay;
  sunday: IBusinessHoursDay;
}

export interface ICancellationPolicy {
  allowCancellation: boolean;
  minNoticeHours: number;
  refundPercentage: number;
}

export interface IReminderSettings {
  enabled: boolean;
  hoursBeforeArray: number[];
}

export interface INotificationSettings {
  appointmentReminder: IReminderSettings;
  appointmentConfirmation: { enabled: boolean };
  appointmentCancellation: { enabled: boolean };
  paymentConfirmation: { enabled: boolean };
}

export interface IStoreConfiguration {
  _id: string;
  appointmentFeeType: AppointmentFeeType;
  appointmentFeeValue: number;
  currency: string;
  minBookingNotice: number; // hours
  maxAdvanceBooking: number; // days
  lateGracePeriod: number; // minutes
  cancellationPolicy: ICancellationPolicy;
  businessHours: IBusinessHours;
  businessHoursTimezone: string;
  notificationSettings: INotificationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStoreConfigurationPayload {
  appointmentFeeType?: AppointmentFeeType;
  appointmentFeeValue?: number;
  currency?: string;
  minBookingNotice?: number;
  maxAdvanceBooking?: number;
  lateGracePeriod?: number;
  cancellationPolicy?: Partial<ICancellationPolicy>;
  businessHours?: Partial<IBusinessHours>;
  businessHoursTimezone?: string;
  notificationSettings?: Partial<INotificationSettings>;
}

// ============================================
// Dashboard Types
// ============================================

// Request parameter types
export interface GetRevenueStatsParams {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string; // ISO format
  endDate?: string; // ISO format
}

export interface GetStaffActivityStatsParams {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Admin Dashboard Response
export interface AdminDashboardResponse {
  overview: {
    appointments: {
      total: number;
      byStatus: {
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        no_show: number;
      };
    };
    payments: {
      total: number;
      totalAmount: number;
      byStatus: {
        pending: number;
        success: number;
        failed: number;
      };
      byMethod: {
        mpesa: number;
        card: number;
        cash: number;
      };
    };
    users: {
      total: number;
      active: number;
      verified: number;
      byRole: {
        customers: number;
        staff: number;
        admins: number;
      };
    };
    services: {
      total: number;
      active: number;
    };
    revenue: {
      total: number;
      outstanding: number;
    };
  };
  recentActivity: {
    appointments: IAppointment[];
    payments: IPayment[];
    users: IUser[];
  };
}

// Client Dashboard Response
export interface ClientDashboardResponse {
  overview: {
    appointments: {
      total: number;
      byStatus: {
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        no_show: number;
      };
    };
    payments: {
      total: number;
      totalAmount: number;
    };
    financial: {
      totalSpent: number;
      outstandingBalance: number;
    };
  };
  recentActivity: {
    appointments: IAppointment[];
    payments: IPayment[];
  };
}

// Revenue Stats Response
export interface RevenueStatsResponse {
  period: {
    start: string;
    end: string;
    type: string;
  };
  revenue: {
    total: number;
    outstanding: number;
    byMethod: {
      mpesa: number;
      card: number;
      cash: number;
    };
  };
  topCustomers: Array<{
    customer: IUser | null;
    total: number;
  }>;
  paymentCount: number;
}

// Appointment Stats Response
export interface AppointmentStatsResponse {
  overview: {
    total: number;
    byStatus: {
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      no_show: number;
    };
  };
  performance: {
    completionRate: number;
    cancellationRate: number;
    noShowRate: number;
    averageDuration: number;
    averageActualDuration: number;
    completed: number;
  };
}

// Service Demand Stats Response
export interface ServiceDemandStatsResponse {
  totalServices: number;
  serviceDemand: Array<{
    service: IService;
    count: number;
    totalRevenue: number;
  }>;
  serviceRevenue: Record<string, number>;
}

// Staff Activity Stats Response
export interface StaffActivityStatsResponse {
  overview: {
    total: number;
    active: number;
    activeInPeriod: number;
  };
  period: {
    start: string;
    end: string;
    type: string;
  };
  topStaff: Array<{
    staff: IUser | null;
    appointmentCount: number;
    completedCount: number;
  }>;
}
