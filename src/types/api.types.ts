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
  dayOfWeek: number; // 0-6, 0 = Sunday
  startTime: string; // HH:mm format
  endTime: string;
  isWorking: boolean;
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
  workingHours?: IWorkingHours[];
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
  isActive?: boolean;
}

// ============================================
// Appointment Types
// ============================================

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface IAppointmentService {
  serviceId: string;
  name: string;
  duration: number;
  price: number;
}

export interface IAppointment {
  _id: string;
  customerId: string | IUser;
  staffId: string | IUser;
  services: IAppointmentService[];
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  bookingFeeAmount: number;
  remainingAmount: number;
  totalAmount: number;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  checkedInAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  staffId: string;
  services: string[];
  startTime: string;
  notes?: string;
}

export interface ConfirmAppointmentPayload {
  paymentMethod: 'mpesa' | 'paystack';
  phoneNumber?: string;
}

export interface RescheduleAppointmentPayload {
  newStartTime: string;
  staffId?: string;
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
  serviceId: string;
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

export type PaymentMethod = 'mpesa' | 'paystack';
export type PaymentType = 'booking_fee' | 'service_payment';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface IProcessorRefs {
  mpesaReceiptNumber?: string;
  mpesaCheckoutRequestId?: string;
  paystackReference?: string;
  paystackTransactionId?: string;
}

export interface IPayment {
  _id: string;
  appointmentId: string | IAppointment;
  customerId: string | IUser;
  amount: number;
  method: PaymentMethod;
  type: PaymentType;
  status: PaymentStatus;
  processorRefs?: IProcessorRefs;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InitiatePaymentPayload {
  appointmentId: string;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  checkoutRequestId?: string;
  authorizationUrl?: string;
  status: PaymentStatus;
}

export interface ServicePaymentPayload {
  appointmentId: string;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
  amount: number;
}

export interface GetPaymentsParams extends PaginationParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
  type?: PaymentType;
  startDate?: string;
  endDate?: string;
}

// ============================================
// Notification Types
// ============================================

export type NotificationType = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationCategory = 'appointment' | 'payment' | 'system' | 'promotional';

export interface INotificationAction {
  label: string;
  type: 'link' | 'action';
  value: string;
}

export interface INotificationContext {
  appointmentId?: string;
  paymentId?: string;
  [key: string]: string | undefined;
}

export interface INotification {
  _id: string;
  recipient: string | IUser;
  type: NotificationType;
  category: NotificationCategory;
  subject: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  actions?: INotificationAction[];
  context?: INotificationContext;
  createdAt: string;
  updatedAt: string;
}

export interface SendNotificationPayload {
  recipientId: string;
  type: NotificationType;
  category: NotificationCategory;
  subject: string;
  message: string;
  actions?: INotificationAction[];
  context?: INotificationContext;
}

export interface GetNotificationsParams extends PaginationParams {
  isRead?: boolean;
}

export interface UnreadCountResponse {
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
// Dashboard Types (Optional - for future use)
// ============================================

export interface IDashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  todayRevenue: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
}

export interface IRevenueStats {
  period: string;
  revenue: number;
  appointmentCount: number;
}
