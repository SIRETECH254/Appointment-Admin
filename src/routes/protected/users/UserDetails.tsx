import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetUserById } from '../../../tanstack/useUsers';
import { formatDateTimeWithTime, getUserInitials, getRoleDisplayName } from '../../../utils/userUtils';
import type { IUser } from '../../../types/api.types';

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

  // Extract user from API response (handle different response shapes)
  const user = (data as any)?.user ?? (data as IUser);

  // Build initials for avatar fallback
  const initials = useMemo(() => {
    if (!user) return 'U';
    return getUserInitials(user);
  }, [user]);

  // Resolve the most relevant role label for the header pill
  const roleLabel = useMemo(() => {
    if (!user) return 'User';
    return getRoleDisplayName(user);
  }, [user]);

  // Get error message from API response
  const errorMessage =
    (error as any)?.response?.data?.message || 'Failed to load user.';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">
        Loading user...
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="alert-error">{errorMessage}</div>
        <Link to="/users" className="btn-secondary">
          Back to Users
        </Link>
      </div>
    );
  }

  // No user found
  if (!user) {
    return (
      <div className="space-y-4">
        <div className="alert-error">User not found.</div>
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
                {/* Role pill shows first available role */}
                <span className="badge badge-soft">{roleLabel}</span>
                {/* Status pill driven by isActive flag */}
                <span
                  className={
                    user.isActive
                      ? 'badge badge-success'
                      : 'badge badge-error'
                  }
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
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

      {/* User details card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Section title */}
        <h2 className="text-lg font-semibold text-gray-900">
          User Details
        </h2>
        {/* Two-column grid on desktop for compact layout */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Contact Information Section */}
          <div>
            <p className="text-xs uppercase text-gray-400">Email</p>
            <p className="text-sm text-gray-700">{user.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Phone</p>
            <p className="text-sm text-gray-700">{user.phone || '—'}</p>
          </div>

          {/* Account Information Section */}
          <div>
            <p className="text-xs uppercase text-gray-400">Role</p>
            <p className="text-sm text-gray-700">{roleLabel}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Status</p>
            <p className="text-sm text-gray-700">
              {user.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Email Verified</p>
            <p className="text-sm text-gray-700">
              {user.isEmailVerified ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Phone Verified</p>
            <p className="text-sm text-gray-700">
              {user.isPhoneVerified ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Account Created</p>
            <p className="text-sm text-gray-700">
              {formatDateTimeWithTime(user.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Last Updated</p>
            <p className="text-sm text-gray-700">
              {formatDateTimeWithTime(user.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
