import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetRoleById } from '../../../tanstack/useRoles';
import { formatDateTimeWithTime, getRoleInitials, formatPermissions } from '../../../utils/roleUtils';
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

  // Format permissions for display
  const permissionsDisplay = useMemo(() => {
    if (!role) return 'No permissions';
    return formatPermissions(role.permissions);
  }, [role]);

  // Get error message from API response
  const errorMessage =
    (error as any)?.response?.data?.message || 'Failed to load role.';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">
        Loading role...
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="alert-error">{errorMessage}</div>
        <Link to="/roles" className="btn-secondary">
          Back to Roles
        </Link>
      </div>
    );
  }

  // No role found
  if (!role) {
    return (
      <div className="space-y-4">
        <div className="alert-error">Role not found.</div>
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
                <span
                  className={
                    role.isActive
                      ? 'badge badge-success'
                      : 'badge badge-error'
                  }
                >
                  {role.isActive ? 'Active' : 'Inactive'}
                </span>
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
        <h2 className="text-lg font-semibold text-gray-900">
          Role Details
        </h2>
        {/* Two-column grid on desktop for compact layout */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Basic Information Section */}
          <div>
            <p className="text-xs uppercase text-gray-400">Name</p>
            <p className="text-sm text-gray-700">{role.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Display Name</p>
            <p className="text-sm text-gray-700">{role.displayName || '—'}</p>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <p className="text-xs uppercase text-gray-400">Description</p>
            <p className="text-sm text-gray-700">{role.description || '—'}</p>
          </div>

          {/* Permissions Section */}
          <div className="md:col-span-2">
            <p className="text-xs uppercase text-gray-400">Permissions</p>
            <div className="mt-2">
              {role.permissions && role.permissions.length > 0 ? (
                role.permissions.includes('*') ? (
                  <span className="badge badge-soft">* (All Permissions)</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission, index) => (
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

          {/* Status Information Section */}
          <div>
            <p className="text-xs uppercase text-gray-400">Status</p>
            <p className="text-sm text-gray-700">
              {role.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">System Role</p>
            <p className="text-sm text-gray-700">
              {role.isSystemRole ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Role Created</p>
            <p className="text-sm text-gray-700">
              {formatDateTimeWithTime(role.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Last Updated</p>
            <p className="text-sm text-gray-700">
              {formatDateTimeWithTime(role.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetails;
