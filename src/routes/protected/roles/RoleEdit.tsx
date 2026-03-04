import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetRoleById, useUpdateRole } from '../../../tanstack/useRoles';
import type { IRole } from '../../../types/api.types';

/**
 * Inline message type for form feedback
 */
type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

/**
 * Parse permissions input string into array
 * Handles comma-separated values or array format
 * 
 * @param input - Comma-separated string or array string
 * @returns Array of permission strings
 */
const parsePermissions = (input: string): string[] => {
  if (!input.trim()) return [];
  // Handle comma-separated values
  return input.split(',').map(p => p.trim()).filter(Boolean);
};

/**
 * RoleEdit Component
 * 
 * Allows admin to edit role information including displayName, description, permissions, and active status.
 * Name field is read-only for system roles since they cannot be renamed.
 * 
 * Features:
 * - Pre-populates form from fetched role data
 * - Validates required fields
 * - Updates role via API
 * - Shows success/error feedback
 * - Navigates on success
 */
const RoleEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TanStack Query hooks
  const { data, isLoading, isError, error } = useGetRoleById(id || '');
  const updateRole = useUpdateRole();

  // Extract role from API response
  const role = data?.role;

  // Form state
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [permissionsInput, setPermissionsInput] = useState('');
  const [isActive, setIsActive] = useState(true);

  // UI state
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect timer ref for cleanup
  const redirectTimer = useRef<number | null>(null);

  /**
   * Hydrate form fields from fetched role data
   * Runs when role data is loaded or changes
   */
  useEffect(() => {
    if (!role) return;

    setName(role.name ?? '');
    setDisplayName(role.displayName ?? '');
    setDescription(role.description ?? '');
    // Convert permissions array to comma-separated string for textarea input
    setPermissionsInput(role.permissions?.join(', ') ?? '');
    setIsActive(role.isActive ?? true);
  }, [role]);

  /**
   * Cleanup redirect timer on unmount
   */
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        window.clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  /**
   * Determine if form can be submitted
   * Requires displayName, and not currently submitting
   */
  const canSubmit = useMemo(() => {
    return Boolean(displayName.trim()) && !isSubmitting;
  }, [displayName, isSubmitting]);

  /**
   * Handle form submission
   * Validates fields, builds payload, and calls update mutation
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Client-side validation
      const trimmedDisplayName = displayName.trim();
      const trimmedDescription = description.trim();
      const trimmedPermissionsInput = permissionsInput.trim();

      if (!trimmedDisplayName) {
        setInlineMessage({
          type: 'error',
          text: 'Display name is required.',
        });
        return;
      }

      setInlineMessage(null);
      setIsSubmitting(true);

      try {
        // Parse permissions from input string
        const permissions = parsePermissions(trimmedPermissionsInput);

        // Build update payload
        const roleData: any = {
          displayName: trimmedDisplayName,
        };

        // Add optional fields if provided
        if (trimmedDescription) {
          roleData.description = trimmedDescription;
        }

        // Add permissions (empty array if none provided)
        roleData.permissions = permissions;

        // Add active status
        roleData.isActive = isActive;

        // Call update mutation
        await updateRole.mutateAsync({
          roleId: id!,
          roleData,
        });

        // Show success message
        setInlineMessage({
          type: 'success',
          text: 'Role updated successfully.',
        });

        // Navigate back to role list after delay
        redirectTimer.current = window.setTimeout(() => {
          navigate('/roles', { replace: true });
        }, 1200);
      } catch (submitError: any) {
        // Extract error message from API response
        const errorMessage = submitError?.response?.data?.message ?? 'An error occurred';
        setInlineMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [displayName, description, permissionsInput, isActive, id, updateRole, navigate]
  );

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
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Role</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update role information and permissions
        </p>
      </div>

      {/* Edit role form */}
      <form
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        {/* Form fields grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Name (read-only if system role) */}
          <div className="auth-field">
            <label className="label">Name</label>
            <input
              type="text"
              value={name}
              disabled={role.isSystemRole}
              className={role.isSystemRole ? 'input-disabled' : 'input'}
            />
            {role.isSystemRole && (
              <p className="mt-1 text-xs text-gray-500">
                System role names cannot be changed
              </p>
            )}
          </div>

          {/* Display Name */}
          <div className="auth-field">
            <label className="label">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              className="input"
              required
            />
          </div>

          {/* Description */}
          <div className="auth-field md:col-span-2">
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Role description"
              className="input"
              rows={3}
            />
          </div>

          {/* Permissions */}
          <div className="auth-field md:col-span-2">
            <label className="label">Permissions</label>
            <textarea
              value={permissionsInput}
              onChange={(e) => setPermissionsInput(e.target.value)}
              placeholder="Comma-separated permissions (e.g., view_users, manage_appointments) or * for all"
              className="input"
              rows={4}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter permissions separated by commas. Use "*" for all permissions.
            </p>
          </div>

          {/* Active status */}
          <div className="auth-field">
            <label className="label">Status</label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active role
              </label>
            </div>
          </div>
        </div>

        {/* Inline success/error message */}
        {inlineMessage ? (
          <div
            className={
              inlineMessage.type === 'success'
                ? 'alert-success mt-4'
                : 'alert-error mt-4'
            }
          >
            {inlineMessage.text}
          </div>
        ) : null}

        {/* Form actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link to="/roles" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!canSubmit || updateRole.isPending}
            className="btn-primary"
          >
            {isSubmitting || updateRole.isPending
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleEdit;
