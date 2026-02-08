import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdEvent,
  MdAccountBalanceWallet,
  MdAttachMoney,
  MdPeople,
  MdBuild,
  MdTrendingUp,
  MdPayment,
} from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import {
  useGetAdminDashboard,
  useGetClientDashboard,
} from '../../tanstack/useDashboard';
import { StatCard } from '../../components/ui/StatCard';
import { ActivitySection } from '../../components/ui/ActivitySection';
import { formatCurrency, formatPaymentMethod, formatPaymentStatus } from '../../utils/paymentUtils';
import {
  formatAppointmentDateTime,
  formatAppointmentStatus,
  getAppointmentStatusVariant,
  getAppointmentCustomerName,
  getAppointmentStaffName,
  getAppointmentServicesDisplay,
} from '../../utils/appointmentUtils';
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
 * - Overview statistics cards with icons
 * - Recent activity sections
 * - Skeleton loading states
 * - Loading and error states
 * - Responsive design using Tailwind CSS classes
 */
const Dashboard = () => {
  const navigate = useNavigate();
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
   * Render skeleton loading state
   */
  if (isLoading) {
    return (
      <div className="page-container section">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-300" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-300" />
        </div>

        {/* Stat Cards Skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(isAdmin ? 6 : 3)].map((_, index) => (
            <div key={index} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-300" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
              </div>
              <div className="mb-2 h-8 w-32 animate-pulse rounded bg-gray-300" />
              <div className="h-3 w-40 animate-pulse rounded bg-gray-300" />
            </div>
          ))}
        </div>

        {/* Activity Sections Skeleton */}
        <div className={`mb-8 grid grid-cols-1 gap-6 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
          {[...Array(isAdmin ? 3 : 2)].map((_, sectionIndex) => (
            <div key={sectionIndex} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-300" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-300" />
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, itemIndex) => (
                  <div key={itemIndex} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 h-4 w-40 animate-pulse rounded bg-gray-300" />
                    <div className="mb-2 h-3 w-32 animate-pulse rounded bg-gray-300" />
                    <div className="h-6 w-20 animate-pulse rounded-full bg-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          ))}
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
      <div className="">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-poppins text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
          {user && (
            <p className="mt-2 font-inter text-sm text-gray-600">
              Welcome, {user.firstName} {user.lastName}!
            </p>
          )}
          <p className="mt-1 font-inter text-sm text-gray-600">System-wide statistics and analytics</p>
        </div>

        {/* Overview Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Appointments Card */}
          <StatCard
            title="Appointments"
            value={overview.appointments.total.toLocaleString()}
            icon={MdEvent}
            iconColor="#7b1c1c"
            subtitle={`${overview.appointments.byStatus.completed} completed • ${overview.appointments.byStatus.confirmed} confirmed • ${overview.appointments.byStatus.pending} pending`}
          />

          {/* Payments Card */}
          <StatCard
            title="Payments"
            value={overview.payments.total.toLocaleString()}
            icon={MdAccountBalanceWallet}
            iconColor="#2563eb"
            subtitle={`${overview.payments.byStatus.success} success • ${formatCurrency(overview.payments.totalAmount, 'KES')} total`}
          />

          {/* Revenue Card */}
          <StatCard
            title="Revenue"
            value={formatCurrency(overview.revenue.total, 'KES')}
            icon={MdAttachMoney}
            iconColor="#059669"
            subtitle={`${formatCurrency(overview.revenue.outstanding, 'KES')} outstanding`}
          />

          {/* Users Card */}
          <StatCard
            title="Users"
            value={overview.users.total.toLocaleString()}
            icon={MdPeople}
            iconColor="#8b5cf6"
            subtitle={`${overview.users.active} active • ${overview.users.verified} verified`}
          />

          {/* Services Card */}
          <StatCard
            title="Services"
            value={overview.services.total.toLocaleString()}
            icon={MdBuild}
            iconColor="#ec4899"
            subtitle={`${overview.services.active} active`}
          />

          {/* Payment Methods Breakdown Card */}
          <StatCard
            title="Payment Methods"
            value={(Object.values(overview.payments.byMethod) as any[]).reduce((a, b) => a + b, 0).toLocaleString()}
            icon={MdPayment}
            iconColor="#D4AF37"
            subtitle={`M-Pesa: ${overview.payments.byMethod.mpesa} • Card: ${overview.payments.byMethod.card} • Cash: ${overview.payments.byMethod.cash}`}
          />
        </div>

        {/* Additional Stats Row */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Users by Role */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <MdPeople size={20} color="#8b5cf6" />
              <p className="font-inter text-sm font-medium text-gray-600">Users by Role</p>
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              <p>Customers: {overview.users.byRole.customers}</p>
              <p>Staff: {overview.users.byRole.staff}</p>
              <p>Admins: {overview.users.byRole.admins}</p>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <MdAccountBalanceWallet size={20} color="#2563eb" />
              <p className="font-inter text-sm font-medium text-gray-600">Payment Status</p>
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              <p>Success: {overview.payments.byStatus.success}</p>
              <p>Pending: {overview.payments.byStatus.pending}</p>
              <p>Failed: {overview.payments.byStatus.failed}</p>
            </div>
          </div>

          {/* Appointment Status Breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <MdEvent size={20} color="#7b1c1c" />
              <p className="font-inter text-sm font-medium text-gray-600">Appointment Status</p>
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              <p>Completed: {overview.appointments.byStatus.completed}</p>
              <p>Confirmed: {overview.appointments.byStatus.confirmed}</p>
              <p>Pending: {overview.appointments.byStatus.pending}</p>
              <p>Cancelled: {overview.appointments.byStatus.cancelled}</p>
              <p>No Show: {overview.appointments.byStatus.no_show}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Appointments */}
          <ActivitySection
            title="Recent Appointments"
            icon={MdEvent}
            items={recentActivity.appointments || []}
            viewAllLink="/appointments"
            onItemPress={(item: IAppointment) => {
              const id = item._id;
              if (id) navigate(`/appointments/${id}`);
            }}
            renderItem={(item: IAppointment) => (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                    {getAppointmentCustomerName(item)}
                  </p>
                  <p className="font-inter text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatAppointmentDateTime(item.startTime)}
                  </p>
                  {item.services && item.services.length > 0 && (
                    <p className="font-inter text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getAppointmentServicesDisplay(item)}
                    </p>
                  )}
                </div>
                <span className={`badge badge-${getAppointmentStatusVariant(item.status)}`}>
                  {formatAppointmentStatus(item.status)}
                </span>
              </div>
            )}
          />

          {/* Recent Payments */}
          <ActivitySection
            title="Recent Payments"
            icon={MdAccountBalanceWallet}
            items={recentActivity.payments || []}
            viewAllLink="/payments"
            onItemPress={(item: IPayment) => {
              const id = item._id;
              if (id) navigate(`/payments/${id}`);
            }}
            renderItem={(item: IPayment) => (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                    {formatCurrency(item.amount, item.currency || 'KES')}
                  </p>
                  <p className="font-inter text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatPaymentMethod(item.method)} • {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <span className={`badge badge-${item.status === 'SUCCESS' ? 'success' : item.status === 'FAILED' ? 'error' : 'soft'}`}>
                  {formatPaymentStatus(item.status)}
                </span>
              </div>
            )}
          />

          {/* Recent Users */}
          <ActivitySection
            title="Recent Users"
            icon={MdPeople}
            items={recentActivity.users || []}
            viewAllLink="/users"
            onItemPress={(item: IUser) => {
              const id = item._id;
              if (id) navigate(`/users/${id}`);
            }}
            renderItem={(item: IUser) => (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                    {item.firstName} {item.lastName}
                  </p>
                  <p className="font-inter text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {item.email}
                  </p>
                  {item.roles && item.roles.length > 0 && (
                    <p className="font-inter text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.roles.map((r) => r.displayName || r.name).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`badge badge-${item.isActive ? 'success' : 'error'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {item.isEmailVerified && (
                    <span className="badge badge-soft text-xs">Verified</span>
                  )}
                </div>
              </div>
            )}
          />
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-poppins text-lg font-semibold text-gray-900">Quick Actions</h2>
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
          <h1 className="font-poppins text-3xl font-semibold text-gray-900">My Dashboard</h1>
          {user && (
            <p className="mt-2 font-inter text-sm text-gray-600">
              Welcome, {user.firstName} {user.lastName}!
            </p>
          )}
          <p className="mt-1 font-inter text-sm text-gray-600">Your appointment and payment overview</p>
        </div>

        {/* Overview Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Appointments Card */}
          <StatCard
            title="My Appointments"
            value={overview.appointments.total.toLocaleString()}
            icon={MdEvent}
            iconColor="#7b1c1c"
            subtitle={`${overview.appointments.byStatus.confirmed} confirmed • ${overview.appointments.byStatus.completed} completed • ${overview.appointments.byStatus.pending} pending`}
          />

          {/* Payments Card */}
          <StatCard
            title="Payments"
            value={overview.payments.total.toLocaleString()}
            icon={MdAccountBalanceWallet}
            iconColor="#2563eb"
            subtitle={`Total: ${formatCurrency(overview.payments.totalAmount, 'KES')}`}
          />

          {/* Total Spent Card */}
          <StatCard
            title="Total Spent"
            value={formatCurrency(overview.financial.totalSpent, 'KES')}
            icon={MdAttachMoney}
            iconColor="#059669"
          />

          {/* Outstanding Balance Card */}
          <StatCard
            title="Outstanding Balance"
            value={formatCurrency(overview.financial.outstandingBalance, 'KES')}
            icon={MdTrendingUp}
            iconColor="#f59e0b"
          />
        </div>

        {/* Recent Activity Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Appointments */}
          <ActivitySection
            title="Recent Appointments"
            icon={MdEvent}
            items={recentActivity.appointments || []}
            viewAllLink="/appointments"
            onItemPress={(item: IAppointment) => {
              const id = item._id;
              if (id) navigate(`/appointments/${id}`);
            }}
            renderItem={(item: IAppointment) => (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                    {formatAppointmentDateTime(item.startTime)}
                  </p>
                  <p className="font-inter text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {getAppointmentStaffName(item) || 'Staff'}
                  </p>
                  {item.services && item.services.length > 0 && (
                    <p className="font-inter text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getAppointmentServicesDisplay(item)}
                    </p>
                  )}
                </div>
                <span className={`badge badge-${getAppointmentStatusVariant(item.status)}`}>
                  {formatAppointmentStatus(item.status)}
                </span>
              </div>
            )}
          />

          {/* Recent Payments */}
          <ActivitySection
            title="Recent Payments"
            icon={MdAccountBalanceWallet}
            items={recentActivity.payments || []}
            viewAllLink="/payments"
            onItemPress={(item: IPayment) => {
              const id = item._id;
              if (id) navigate(`/payments/${id}`);
            }}
            renderItem={(item: IPayment) => (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-inter text-base font-semibold text-gray-900 dark:text-gray-50">
                    {formatCurrency(item.amount, item.currency || 'KES')}
                  </p>
                  <p className="font-inter text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatPaymentMethod(item.method)} • {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <span className={`badge badge-${item.status === 'SUCCESS' ? 'success' : item.status === 'FAILED' ? 'error' : 'soft'}`}>
                  {formatPaymentStatus(item.status)}
                </span>
              </div>
            )}
          />
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-poppins text-lg font-semibold text-gray-900">Quick Actions</h2>
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
