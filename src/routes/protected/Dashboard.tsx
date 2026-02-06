import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  useGetAdminDashboard,
  useGetClientDashboard,
} from '../../tanstack/useDashboard';
import { formatCurrency } from '../../utils/paymentUtils';
import { formatAppointmentDateTime, formatAppointmentStatus, getAppointmentStatusVariant } from '../../utils/appointmentUtils';
import { formatDateTime } from '../../utils/userUtils';
import type { IAppointment, IPayment, IUser } from '../../types/api.types';

/**
 * Dashboard Component
 * 
 * Main dashboard component that displays different views based on user role:
 * - Admin Dashboard: System-wide statistics and analytics
 * - Client Dashboard: Customer-specific statistics and overview
 * 
 * Features:
 * - Role-based rendering (admin vs client)
 * - Overview statistics cards
 * - Recent activity sections
 * - Loading and error states
 * - Responsive design using Tailwind CSS classes
 */
const Dashboard = () => {
  // Get authenticated user from auth context
  const { user } = useAuth();

  /**
   * Check if user has admin role
   * Admin role is determined by checking if user has a role with name 'admin'
   */
  const isAdmin = useMemo(() => {
    if (!user?.roles || user.roles.length === 0) return false;
    return user.roles.some((role) => role.name?.toLowerCase() === 'admin');
  }, [user]);

  // Fetch dashboard data based on user role
  const {
    data: adminData,
    isLoading: adminLoading,
    isError: adminError,
  } = useGetAdminDashboard();

  const {
    data: clientData,
    isLoading: clientLoading,
    isError: clientError,
  } = useGetClientDashboard();

  // Determine which data to use based on role
  const isLoading = isAdmin ? adminLoading : clientLoading;
  const isError = isAdmin ? adminError : clientError;
  const dashboardData = isAdmin ? adminData : clientData;

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="page-container section">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-primary border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (isError) {
    return (
      <div className="page-container section">
        <div className="alert-error">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  /**
   * Render admin dashboard view
   */
  if (isAdmin && dashboardData?.data) {
    const { overview, recentActivity } = dashboardData.data;

    return (
      <div className="page-container section">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">System-wide statistics and analytics</p>
        </div>

        {/* Overview Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Appointments Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {overview.appointments.total.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-brand-tint p-3">
                <svg className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-600">
              <span>Pending: {overview.appointments.byStatus.pending}</span>
              <span>Confirmed: {overview.appointments.byStatus.confirmed}</span>
              <span>Completed: {overview.appointments.byStatus.completed}</span>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {formatCurrency(overview.revenue.total, 'KES')}
                </p>
              </div>
              <div className="rounded-full bg-brand-tint p-3">
                <svg className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              Outstanding: {formatCurrency(overview.revenue.outstanding, 'KES')}
            </div>
          </div>

          {/* Users Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {overview.users.total.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-brand-tint p-3">
                <svg className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-600">
              <span>Customers: {overview.users.byRole.customers}</span>
              <span>Staff: {overview.users.byRole.staff}</span>
              <span>Admins: {overview.users.byRole.admins}</span>
            </div>
          </div>

          {/* Payments Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {overview.payments.total.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-brand-tint p-3">
                <svg className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              Total Amount: {formatCurrency(overview.payments.totalAmount, 'KES')}
            </div>
          </div>

          {/* Services Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {overview.services.total.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-brand-tint p-3">
                <svg className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              Active: {overview.services.active}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Appointments */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
              <Link to="/appointments" className="text-sm font-medium text-brand-primary hover:text-brand-accent">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.appointments && recentActivity.appointments.length > 0 ? (
                recentActivity.appointments.slice(0, 5).map((appointment: IAppointment) => (
                  <div key={appointment._id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {typeof appointment.customerId === 'object' && appointment.customerId
                          ? `${(appointment.customerId as IUser).firstName} ${(appointment.customerId as IUser).lastName}`
                          : 'Unknown Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatAppointmentDateTime(appointment.startTime)}
                      </p>
                    </div>
                    <span className={`badge badge-${getAppointmentStatusVariant(appointment.status)}`}>
                      {formatAppointmentStatus(appointment.status)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent appointments</p>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
              <Link to="/payments" className="text-sm font-medium text-brand-primary hover:text-brand-accent">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.payments && recentActivity.payments.length > 0 ? (
                recentActivity.payments.slice(0, 5).map((payment: IPayment) => (
                  <div key={payment._id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency || 'KES')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(payment.createdAt)}
                      </p>
                    </div>
                    <span className={`badge badge-${payment.status === 'SUCCESS' ? 'success' : payment.status === 'FAILED' ? 'error' : 'soft'}`}>
                      {payment.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent payments</p>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <Link to="/users" className="text-sm font-medium text-brand-primary hover:text-brand-accent">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.users && recentActivity.users.length > 0 ? (
                recentActivity.users.slice(0, 5).map((user: IUser) => (
                  <div key={user._id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className={`badge badge-${user.isActive ? 'success' : 'error'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent users</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/appointments/new" className="btn-primary">
              New Appointment
            </Link>
            <Link to="/users/new" className="btn-secondary">
              Add User
            </Link>
            <Link to="/services/new" className="btn-secondary">
              Add Service
            </Link>
            <Link to="/payments" className="btn-ghost">
              View Payments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render client dashboard view
   */
  if (!isAdmin && dashboardData?.data) {
    const { overview, recentActivity } = dashboardData.data;

    return (
      <div className="">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">My Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Your appointment and payment overview</p>
        </div>

        {/* Overview Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Appointments Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Appointments</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {overview.appointments.total.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-brand-tint p-3">
                <svg className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-600">
              <span>Pending: {overview.appointments.byStatus.pending}</span>
              <span>Confirmed: {overview.appointments.byStatus.confirmed}</span>
              <span>Completed: {overview.appointments.byStatus.completed}</span>
            </div>
          </div>

          {/* Total Spent Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {formatCurrency(overview.financial.totalSpent, 'KES')}
                </p>
              </div>
              <div className="rounded-full bg-brand-tint p-3">
                <svg className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Outstanding Balance Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {formatCurrency(overview.financial.outstandingBalance, 'KES')}
                </p>
              </div>
              <div className="rounded-full bg-brand-tint p-3">
                <svg className="h-6 w-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Appointments */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
              <Link to="/appointments" className="text-sm font-medium text-brand-primary hover:text-brand-accent">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.appointments && recentActivity.appointments.length > 0 ? (
                recentActivity.appointments.slice(0, 5).map((appointment: IAppointment) => (
                  <div key={appointment._id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formatAppointmentDateTime(appointment.startTime)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {typeof appointment.staffId === 'object' && appointment.staffId
                          ? `${(appointment.staffId as IUser).firstName} ${(appointment.staffId as IUser).lastName}`
                          : 'Staff'}
                      </p>
                    </div>
                    <span className={`badge badge-${getAppointmentStatusVariant(appointment.status)}`}>
                      {formatAppointmentStatus(appointment.status)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent appointments</p>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
              <Link to="/payments" className="text-sm font-medium text-brand-primary hover:text-brand-accent">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.payments && recentActivity.payments.length > 0 ? (
                recentActivity.payments.slice(0, 5).map((payment: IPayment) => (
                  <div key={payment._id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency || 'KES')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(payment.createdAt)}
                      </p>
                    </div>
                    <span className={`badge badge-${payment.status === 'SUCCESS' ? 'success' : payment.status === 'FAILED' ? 'error' : 'soft'}`}>
                      {payment.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent payments</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/appointments/new" className="btn-primary">
              Book Appointment
            </Link>
            <Link to="/appointments" className="btn-secondary">
              My Appointments
            </Link>
            <Link to="/profile" className="btn-ghost">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback if no data
  return (
    <div className="page-container section">
      <div className="alert-info">
        <p>No dashboard data available.</p>
      </div>
    </div>
  );
};

export default Dashboard;
