import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiMail, FiPhone, FiShield, FiCheckCircle, FiXCircle, FiCalendar, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { useGetUserById } from '../../../tanstack/useUsers';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatDateTimeWithTime, getUserInitials } from '../../../utils/userUtils';
import type { IRole } from '../../../types/api.types';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const formatDayName = (day: string): string => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

/**
 * UserDetails Component
 * 
 * Displays detailed information about a specific user.
 * Shows avatar, name, contact information, role, status, and account details.
 * Provides Edit button for quick access to edit page.
 * 
 * Features:
 * - User profile header with avatar and basic info
 * - Contact information section
 * - Account details section
 * - Edit action button
 * - Loading and error states
 */
const UserDetails = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch user data
  const { data, isLoading, isError, error } = useGetUserById(id || '');

  // Extract user from API response
  const user = data?.user;

  // Build initials for avatar fallback
  const initials = useMemo(() => {
    if (!user) return 'U';
    return getUserInitials(user);
  }, [user]);

  // Check if user has staff role
  const hasStaffRole = useMemo(() => {
    if (!user?.roles) return false;
    return user.roles.some((role: IRole) => role.name === 'staff' || role.name === 'Staff');
  }, [user]);

  // Get error message from API response
  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="flex flex-col gap-6 items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-300" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-300 rounded" />
                <div className="h-4 w-64 bg-gray-300 rounded" />
                <div className="flex gap-2 mt-3">
                  <div className="h-6 w-20 bg-gray-300 rounded-full" />
                  <div className="h-6 w-20 bg-gray-300 rounded-full" />
                  <div className="h-6 w-20 bg-gray-300 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-gray-300 rounded" />
              <div className="h-10 w-32 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
        {/* Contact Information skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded" />
                <div className="h-4 w-48 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        </div>
        {/* Account Information skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded" />
                <div className="h-4 w-32 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        </div>
        {/* System Information skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded" />
                <div className="h-4 w-48 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <FiAlertTriangle className="h-16 w-16 text-red-500" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error Loading User</h2>
          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
        </div>
        <Link to="/users" className="btn-secondary">
          Back to Users
        </Link>
      </div>
    );
  }

  // No user found
  if (!user) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <FiXCircle className="h-16 w-16 text-gray-400" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">User Not Found</h2>
          <p className="mt-2 text-sm text-gray-500">The user you're looking for doesn't exist.</p>
        </div>
        <Link to="/users" className="btn-secondary">
          Back to Users
        </Link>
      </div>
    );
  }

  console.log(user);

  return (
    <div className="space-y-6">
      {/* User header card: avatar, identity, and primary actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Layout: stack on mobile, align items side-by-side on desktop */}
        <div className="flex flex-col gap-6 items-center justify-center">
          {/* Identity block: avatar + name + metadata */}
          <div className="flex items-center gap-4">
            {user.avatar ? (
              // Server-hosted avatar image when available
              <img
                src={user.avatar}
                alt={`${user.firstName ?? 'User'} avatar`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              // Initials badge fallback when avatar is missing
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-xl font-semibold text-white">
                {initials}
              </div>
            )}
            <div>
              {/* Primary identity label */}
              <h1 className="text-xl font-semibold text-gray-900">
                {user.firstName ?? 'User'} {user.lastName ?? ''}
              </h1>
              {/* Secondary identity label (email) */}
              <p className="text-sm text-gray-500">{user.email ?? '—'}</p>
              {/* Role + status pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {/* Display all roles */}
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role: IRole) => (
                    <StatusBadge key={role._id} status={role.name} type="user-role" />
                  ))
                ) : null}
                {/* Status pill driven by isActive flag */}
                <StatusBadge status={user.isActive ? 'active' : 'inactive'} type="user-status" />
              </div>
            </div>
          </div>

          {/* CTA block: edit action */}
          <div className="flex flex-wrap gap-3">
            {/* Primary CTA: navigate to edit form */}
            <Link to={`/users/${user._id}/edit`} className="btn-primary">
              Edit User
            </Link>
            {/* Secondary CTA: back to list */}
            <Link to="/users" className="btn-secondary">
              Back to Users
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiMail className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
        </div>
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-start gap-3">
            <FiMail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Email</p>
              <p className="text-sm text-gray-700">{user.email || '—'}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <FiPhone className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Phone</p>
              <p className="text-sm text-gray-700">{user.phone || '—'}</p>
            </div>
          </div>
            </div>
          </div>

      {/* Account Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiShield className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
        </div>
        <div className="space-y-4">
          {/* Role */}
          <div className="flex items-start gap-3">
            <FiShield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Role</p>
              <div className="flex flex-wrap gap-1">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role: IRole) => (
                    <StatusBadge key={role._id} status={role.name} type="user-role" />
                  ))
                ) : (
                  <p className="text-sm text-gray-700">—</p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            {user.isActive ? (
              <FiCheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <FiXCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Status</p>
              <StatusBadge status={user.isActive ? 'active' : 'inactive'} type="user-status" />
            </div>
          </div>

          {/* Email Verified */}
          <div className="flex items-start gap-3">
            <FiMail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Email Verified</p>
              <StatusBadge status={user.isEmailVerified || false} type="verified-status" />
            </div>
          </div>

          {/* Phone Verified */}
          <div className="flex items-start gap-3">
            <FiPhone className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Phone Verified</p>
              <StatusBadge status={user.isPhoneVerified || false} type="verified-status" />
            </div>
          </div>
        </div>
      </div>

      {/* Working Hours Section - Only show if user has staff role */}
      {hasStaffRole && user.workingHours && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiClock className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">Working Hours</h2>
          </div>
          <div className="space-y-3">
            {DAYS.map((day) => {
              const dayHours = user.workingHours?.[day];
              if (!dayHours || dayHours.length === 0) {
                return (
                  <div key={day} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="w-24 flex-shrink-0">
                      <p className="text-sm font-medium text-gray-700 capitalize">{formatDayName(day)}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Not available</p>
                    </div>
                  </div>
                );
              }
              return (
                <div key={day} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="w-24 flex-shrink-0">
                    <p className="text-sm font-medium text-gray-700 capitalize">{formatDayName(day)}</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {dayHours.map((slot: { start: string; end: string }, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          {slot.start} - {slot.end}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* System Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
        </div>
        <div className="space-y-4">
          {/* Account Created */}
          <div className="flex items-start gap-3">
            <FiCalendar className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Account Created</p>
              <p className="text-sm text-gray-700">
                {formatDateTimeWithTime(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-start gap-3">
            <FiClock className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Last Updated</p>
              <p className="text-sm text-gray-700">
                {formatDateTimeWithTime(user.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
