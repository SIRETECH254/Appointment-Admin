import { api } from './config';
import type {
  // Auth types
  RegisterPayload,
  LoginPayload,
  VerifyOTPPayload,
  ResendOTPPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
  // User types
  UpdateProfilePayload,
  ChangePasswordPayload,
  UpdateNotificationPreferencesPayload,
  AdminCreateUserPayload,
  UpdateUserStatusPayload,
  SetUserAdminPayload,
  AssignRolePayload,
  GetCustomersParams,
  GetUsersParams,
  // Role types
  CreateRolePayload,
  UpdateRolePayload,
  // Service types
  CreateServicePayload,
  UpdateServicePayload,
  AssignServicesToStaffPayload,
  GetServicesParams,
  // Appointment types
  CreateAppointmentPayload,
  ConfirmAppointmentPayload,
  RescheduleAppointmentPayload,
  CancelAppointmentPayload,
  GetAppointmentsParams,
  GetMyAppointmentsParams,
  // Availability types
  GetSlotsParams,
  GetDayAvailabilityParams,
  // Break types
  CreateBreakPayload,
  UpdateBreakPayload,
  GetBreaksParams,
  // Payment types
  InitiatePaymentPayload,
  ServicePaymentPayload,
  GetPaymentsParams,
  // Notification types
  SendNotificationPayload,
  SendBulkNotificationPayload,
  GetNotificationsParams,
  // Contact types
  SubmitContactPayload,
  UpdateContactStatusPayload,
  ReplyToContactPayload,
  GetContactsParams,
  // Store configuration types
  UpdateStoreConfigurationPayload,
  // Dashboard types
  GetRevenueStatsParams,
  GetStaffActivityStatsParams,
  // Common types
  PaginationParams,
} from '../types/api.types';

// ============================================
// Auth API
// ============================================
export const authAPI = {
  // Register a new user account.
  register: (userData: RegisterPayload) => api.post('/api/auth/register', userData),

  // Verify a one-time password (OTP) for authentication.
  verifyOTP: (otpData: VerifyOTPPayload) => api.post('/api/auth/verify-otp', otpData),

  // Request a new OTP for verification.
  resendOTP: (emailData: ResendOTPPayload) => api.post('/api/auth/resend-otp', emailData),

  // Login with credentials and receive tokens.
  login: (credentials: LoginPayload) => api.post('/api/auth/login', credentials),

  // Logout the current session.
  logout: () => api.post('/api/auth/logout'),

  // Request a password reset email.
  forgotPassword: (data: ForgotPasswordPayload) => api.post('/api/auth/forgot-password', data),

  // Reset password using a token link.
  resetPassword: (token: string, data: ResetPasswordPayload) => api.post(`/api/auth/reset-password/${token}`, data),

  // Refresh access token using a refresh token.
  refreshToken: (data: RefreshTokenPayload) => api.post('/api/auth/refresh-token', data),

  // Fetch the current authenticated user profile.
  getMe: () => api.get('/api/auth/me'),
};

// ============================================
// User API
// ============================================
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),

  updateProfile: (profileData: UpdateProfilePayload | FormData) =>
    profileData instanceof FormData
      ? api.put('/api/users/profile', profileData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put('/api/users/profile', profileData),

  changePassword: (passwordData: ChangePasswordPayload) => api.put('/api/users/change-password', passwordData),

  getNotificationPreferences: () => api.get('/api/users/notifications'),

  updateNotificationPreferences: (preferences: UpdateNotificationPreferencesPayload) => api.put('/api/users/notifications', preferences),

  adminCreateUser: (userData: AdminCreateUserPayload) => api.post('/api/users/admin-create', userData),

  getCustomers: (params?: GetCustomersParams) => api.get('/api/users/customers', { params }),

  getAllUsers: (params?: GetUsersParams) => api.get('/api/users', { params }),

  getUserById: (userId: string) => api.get(`/api/users/${userId}`),

  updateUser: (userId: string, userData: Partial<AdminCreateUserPayload>) => api.put(`/api/users/${userId}`, userData),

  deleteUser: (userId: string) => api.delete(`/api/users/${userId}`),

  updateUserStatus: (userId: string, statusData: UpdateUserStatusPayload) => api.put(`/api/users/${userId}/status`, statusData),

  setUserAdmin: (userId: string, adminData: SetUserAdminPayload) => api.put(`/api/users/${userId}/admin`, adminData),

  getUserRoles: (userId: string) => api.get(`/api/users/${userId}/roles`),

  assignRole: (userId: string, roleData: AssignRolePayload) => api.post(`/api/users/${userId}/roles`, roleData),

  removeRole: (userId: string, roleId: string) => api.delete(`/api/users/${userId}/roles/${roleId}`),
};

// ============================================
// Role API
// ============================================
export const roleAPI = {
  getAllRoles: (params?: PaginationParams) => api.get('/api/roles', { params }),

  getRole: (roleId: string) => api.get(`/api/roles/${roleId}`),

  createRole: (roleData: CreateRolePayload) => api.post('/api/roles', roleData),

  updateRole: (roleId: string, roleData: UpdateRolePayload) => api.put(`/api/roles/${roleId}`, roleData),

  deleteRole: (roleId: string) => api.delete(`/api/roles/${roleId}`),

  getUsersByRole: (roleId: string, params?: PaginationParams) => api.get(`/api/roles/${roleId}/users`, { params }),

  getCustomerUsers: (params?: PaginationParams) => api.get('/api/roles/customer/users', { params }),
};

// ============================================
// Service API
// ============================================
export const serviceAPI = {
  getAllServices: (params?: GetServicesParams) => api.get('/api/services', { params }),

  getService: (serviceId: string) => api.get(`/api/services/${serviceId}`),

  createService: (serviceData: CreateServicePayload) => api.post('/api/services', serviceData),

  updateService: (serviceId: string, serviceData: UpdateServicePayload) => api.put(`/api/services/${serviceId}`, serviceData),

  deleteService: (serviceId: string) => api.delete(`/api/services/${serviceId}`),

  toggleServiceStatus: (serviceId: string) => api.patch(`/api/services/${serviceId}/toggle-status`),

  assignServicesToStaff: (userId: string, data: AssignServicesToStaffPayload) => api.post(`/api/services/assign/${userId}`, data),
};

// ============================================
// Appointment API
// ============================================
export const appointmentAPI = {
  create: (appointmentData: CreateAppointmentPayload) => api.post('/api/appointments', appointmentData),

  confirm: (appointmentId: string, paymentData: ConfirmAppointmentPayload) => api.post(`/api/appointments/${appointmentId}/confirm`, paymentData),

  reschedule: (appointmentId: string, data: RescheduleAppointmentPayload) => api.patch(`/api/appointments/${appointmentId}/reschedule`, data),

  cancel: (appointmentId: string, data?: CancelAppointmentPayload) => api.patch(`/api/appointments/${appointmentId}/cancel`, data),

  checkIn: (appointmentId: string) => api.patch(`/api/appointments/${appointmentId}/check-in`),

  complete: (appointmentId: string) => api.patch(`/api/appointments/${appointmentId}/complete`),

  markNoShow: (appointmentId: string) => api.patch(`/api/appointments/${appointmentId}/no-show`),

  getAllAppointments: (params?: GetAppointmentsParams) => api.get('/api/appointments', { params }),

  getMyAppointments: (params?: GetMyAppointmentsParams) => api.get('/api/appointments/my', { params }),

  getAppointment: (appointmentId: string) => api.get(`/api/appointments/${appointmentId}`),

  deleteAppointment: (appointmentId: string) => api.delete(`/api/appointments/${appointmentId}`),
};

// ============================================
// Availability API
// ============================================
export const availabilityAPI = {
  getSlots: (params: GetSlotsParams) => {
    // Handle multiple serviceIds - axios needs special handling for repeated query params
    const queryParams: any = {
      staffId: params.staffId,
      date: params.date,
    };
    
    // If serviceId is an array, we need to use paramsSerializer to format it correctly
    // The API expects: ?serviceId=id1&serviceId=id2 (not serviceId[]=id1&serviceId[]=id2)
    if (Array.isArray(params.serviceId)) {
      // Build URL manually for multiple serviceIds
      const baseUrl = '/api/availability/slots';
      const queryString = [
        `staffId=${encodeURIComponent(params.staffId)}`,
        ...params.serviceId.map(id => `serviceId=${encodeURIComponent(id)}`),
        `date=${encodeURIComponent(params.date)}`,
      ].join('&');
      return api.get(`${baseUrl}?${queryString}`);
    } else {
      queryParams.serviceId = params.serviceId;
      return api.get('/api/availability/slots', { params: queryParams });
    }
  },

  getDayAvailability: (params: GetDayAvailabilityParams) => api.get('/api/availability/day', { params }),
};

// ============================================
// Break API
// ============================================
export const breakAPI = {
  getAllBreaks: (params?: GetBreaksParams) => api.get('/api/breaks', { params }),

  getBreak: (breakId: string) => api.get(`/api/breaks/${breakId}`),

  createBreak: (breakData: CreateBreakPayload) => api.post('/api/breaks', breakData),

  updateBreak: (breakId: string, breakData: UpdateBreakPayload) => api.put(`/api/breaks/${breakId}`, breakData),

  deleteBreak: (breakId: string) => api.delete(`/api/breaks/${breakId}`),
};

// ============================================
// Payment API
// ============================================
export const paymentAPI = {
  initiatePayment: (paymentData: InitiatePaymentPayload) => api.post('/api/payments/initiate', paymentData),

  servicePayment: (paymentData: ServicePaymentPayload) => api.post('/api/payments/service-payment', paymentData),

  getAllPayments: (params?: GetPaymentsParams) => api.get('/api/payments', { params }),

  getPayment: (paymentId: string) => api.get(`/api/payments/${paymentId}`),

  queryMpesaStatus: (checkoutRequestId: string) => api.get(`/api/payments/status/${checkoutRequestId}`),
};

// ============================================
// Notification API
// ============================================
export const notificationAPI = {
  sendNotification: (notificationData: SendNotificationPayload) => api.post('/api/notifications', notificationData),

  getNotifications: (params?: GetNotificationsParams) => api.get('/api/notifications', { params }),

  getNotification: (notificationId: string) => api.get(`/api/notifications/${notificationId}`),

  getUnreadCount: () => api.get('/api/notifications/unread-count'),

  getUnreadNotifications: (params?: { limit?: number }) => api.get('/api/notifications/unread', { params }),

  getNotificationsByCategory: (category: string) => api.get(`/api/notifications/category/${category}`),

  markAsRead: (notificationId: string) => api.patch(`/api/notifications/${notificationId}/read`),

  markAllAsRead: () => api.patch('/api/notifications/read-all'),

  deleteNotification: (notificationId: string) => api.delete(`/api/notifications/${notificationId}`),

  sendBulkNotification: (bulkData: SendBulkNotificationPayload) => api.post('/api/notifications/bulk', bulkData),
};

// ============================================
// Contact API
// ============================================
export const contactAPI = {
  submitMessage: (messageData: SubmitContactPayload) => api.post('/api/contact', messageData),

  getAllMessages: (params?: GetContactsParams) => api.get('/api/contact', { params }),

  getMessage: (contactId: string) => api.get(`/api/contact/${contactId}`),

  updateStatus: (contactId: string, statusData: UpdateContactStatusPayload) => api.patch(`/api/contact/${contactId}/status`, statusData),

  replyToMessage: (contactId: string, replyData: ReplyToContactPayload) => {
    // Backend expects 'message' but frontend type uses 'reply'
    const payload = { message: replyData.reply };
    return api.post(`/api/contact/${contactId}/reply`, payload);
  },
};

// ============================================
// Store Configuration API
// ============================================
export const storeConfigurationAPI = {
  getConfiguration: () => api.get('/api/store-configuration'),

  updateConfiguration: (configData: UpdateStoreConfigurationPayload) => api.put('/api/store-configuration', configData),
};

// ============================================
// Dashboard API
// ============================================
export const dashboardAPI = {
  // Get admin dashboard statistics
  getAdminDashboard: () => api.get('/api/dashboard/admin'),

  // Get client dashboard statistics
  getClientDashboard: () => api.get('/api/dashboard/client'),

  // Get revenue analytics
  getRevenueStats: (params?: GetRevenueStatsParams) => api.get('/api/dashboard/revenue', { params }),

  // Get appointment statistics
  getAppointmentStats: () => api.get('/api/dashboard/appointments'),

  // Get service demand analytics
  getServiceDemandStats: () => api.get('/api/dashboard/service-demand'),

  // Get staff activity statistics
  getStaffActivityStats: (params?: GetStaffActivityStatsParams) => api.get('/api/dashboard/staff-activity', { params }),
};

// Export the api instance for custom requests
export { api };
export default api;
