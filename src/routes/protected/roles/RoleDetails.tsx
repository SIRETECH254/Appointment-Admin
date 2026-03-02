import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiShield, FiTag, FiFileText, FiKey, FiCheckCircle, FiXCircle, FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import { useGetRoleById } from '../../../tanstack/useRoles';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatDateTimeWithTime, getRoleInitials } from '../../../utils/roleUtils';
import type { IRole } from '../../../types/api.types';

/**
 * RoleDetails Component
 * 
 * Displays detailed information about a specific role.
 * Shows name, displayName, description, permissions, system role indicator, and status.
 * Provides Edit button for quick access to edit page.
 * 
 * Features:
 * - Role profile header with initials avatar and basic info
 * - Permissions list display
 * - System role indicator
 * - Account details section
 * - Edit action button
 * - Loading and error states
 */
const RoleDetails = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch role data
  const { data, isLoading, isError, error } = useGetRoleById(id || '');

  // Extract role from API response (handle different response shapes)
  const role = (data as any)?.role ?? (data as IRole);

  // Build initials for avatar fallback
  const initials = useMemo(() => {
    if (!role) return 'R';
    return getRoleInitials(role);
  }, [role]);

  // Get error message from API response
  const errorMessage =
    (error as any)?.response?.data?.message || 'Failed to load role.';

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="flex flex-col gap-6 items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-300" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-300 rounded" />
                <div className="h-4 w-32 bg-gray-300 rounded" />
                <div className="flex gap-2 mt-3">
                  <div className="h-6 w-20 bg-gray-300 rounded-full" />
                  <div className="h-6 w-24 bg-gray-300 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-gray-300 rounded" />
              <div className="h-10 w-32 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-32 bg-gray-300 rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-300 rounded animate-pulse" />
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
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Role</h2>
          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
        </div>
        <Link to="/roles" className="btn-secondary">
          Back to Roles
        </Link>
      </div>
    );
  }

  // No role found
  if (!role) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <FiXCircle className="h-16 w-16 text-gray-400" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Role Not Found</h2>
          <p className="mt-2 text-sm text-gray-500">The role you're looking for doesn't exist.</p>
        </div>
        <Link to="/roles" className="btn-secondary">
          Back to Roles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role header card: avatar, identity, and primary actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Layout: stack on mobile, align items side-by-side on desktop */}
        <div className="flex flex-col gap-6 items-center justify-center">
          {/* Identity block: avatar + name + metadata */}
          <div className="flex items-center gap-4">
            {/* Initials badge fallback when avatar is missing */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-xl font-semibold text-white">
              {initials}
            </div>
            <div>
              {/* Primary identity label */}
              <h1 className="text-xl font-semibold text-gray-900">
                {role.displayName || role.name}
              </h1>
              {/* Secondary identity label (name) */}
              <p className="text-sm text-gray-500">{role.name || '—'}</p>
              {/* Status + system role pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {/* Status pill driven by isActive flag */}
                <StatusBadge status={role.isActive} type="service-status" />
                {/* System role pill */}
                <span className={role.isSystemRole ? 'badge badge-soft' : 'badge badge-success'}>
                  {role.isSystemRole ? 'System Role' : 'Custom Role'}
                </span>
              </div>
            </div>
          </div>

          {/* CTA block: edit action */}
          <div className="flex flex-wrap gap-3">
            {/* Primary CTA: navigate to edit form */}
            <Link to={`/roles/${role._id}/edit`} className="btn-primary">
              Edit Role
            </Link>
            {/* Secondary CTA: back to list */}
            <Link to="/roles" className="btn-secondary">
              Back to Roles
            </Link>
          </div>
        </div>
      </div>

      {/* Role details card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Section title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Role Details
        </h2>
        {/* Vertical list layout */}
        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-start gap-3">
            <FiTag className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Name</p>
              <p className="text-sm text-gray-700">{role.name || '—'}</p>
            </div>
          </div>

          {/* Display Name */}
          <div className="flex items-start gap-3">
            <FiShield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Display Name</p>
              <p className="text-sm text-gray-700">{role.displayName || '—'}</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <FiFileText className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700">{role.description || '—'}</p>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="flex items-start gap-3">
            <FiKey className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Permissions</p>
              <div className="mt-2">
                {role.permissions && role.permissions.length > 0 ? (
                  role.permissions.includes('*') ? (
                    <span className="badge badge-soft">* (All Permissions)</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission: string, index: number) => (
                        <span key={index} className="badge badge-soft">
                          {permission}
                        </span>
                      ))}
                    </div>
                  )
                ) : (
                  <p className="text-sm text-gray-500">No permissions assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            {role.isActive ? (
              <FiCheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <FiXCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Status</p>
              <StatusBadge status={role.isActive} type="service-status" />
            </div>
          </div>

          {/* System Role */}
          <div className="flex items-start gap-3">
            <FiShield className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">System Role</p>
              <p className="text-sm text-gray-700">
                {role.isSystemRole ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          {/* Role Created */}
          <div className="flex items-start gap-3">
            <FiCalendar className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Role Created</p>
              <p className="text-sm text-gray-700">
                {formatDateTimeWithTime(role.createdAt)}
              </p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-start gap-3">
            <FiCalendar className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Last Updated</p>
              <p className="text-sm text-gray-700">
                {formatDateTimeWithTime(role.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetails;
