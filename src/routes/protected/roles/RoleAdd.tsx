import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateRole } from '../../../tanstack/useRoles';
import type { CreateRolePayload } from '../../../types/api.types';

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
 * RoleAdd Component
 * 
 * Allows admin to create a new custom role.
 * All required fields must be filled, and role name must be unique.
 * 
 * Features:
 * - Form validation (required fields, name uniqueness)
 * - Creates role via API
 * - Shows success/error feedback
 * - Navigates to role details on success
 */
const RoleAdd = () => {
  const navigate = useNavigate();

  // TanStack Query hook
  const createRole = useCreateRole();

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
   * Requires name and displayName, and not currently submitting
   */
  const canSubmit = useMemo(() => {
    return (
      Boolean(
        name.trim() &&
        displayName.trim()
      ) && !isSubmitting
    );
  }, [name, displayName, isSubmitting]);

  /**
   * Handle form submission
   * Validates all fields, builds payload, and calls create mutation
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Trim all input values
      const trimmedName = name.trim().toLowerCase();
      const trimmedDisplayName = displayName.trim();
      const trimmedDescription = description.trim();
      const trimmedPermissionsInput = permissionsInput.trim();

      // Client-side validation
      if (!trimmedName || !trimmedDisplayName) {
        setInlineMessage({
          type: 'error',
          text: 'Name and display name are required.',
        });
        return;
      }

      // Validate name format (lowercase, alphanumeric and underscores)
      const nameRegex = /^[a-z0-9_]+$/;
      if (!nameRegex.test(trimmedName)) {
        setInlineMessage({
          type: 'error',
          text: 'Name must contain only lowercase letters, numbers, and underscores.',
        });
        return;
      }

      setInlineMessage(null);
      setIsSubmitting(true);

      try {
        // Parse permissions from input string
        const permissions = parsePermissions(trimmedPermissionsInput);

        // Build create payload
        const roleData: CreateRolePayload = {
          name: trimmedName,
          displayName: trimmedDisplayName,
          permissions,
          isActive,
        };

        // Add description if provided
        if (trimmedDescription) {
          roleData.description = trimmedDescription;
        }

        // Call create mutation
        const result = await createRole.mutateAsync(roleData);

        // Extract role ID from response (handle different response shapes)
        const createdRole = (result as any)?.role ?? result;
        const roleId = createdRole?._id || (result as any)?._id;

        // Show success message
        setInlineMessage({
          type: 'success',
          text: 'Role created successfully.',
        });

        // Navigate to role details page after delay
        if (roleId) {
          redirectTimer.current = window.setTimeout(() => {
            navigate(`/roles/${roleId}`, { replace: true });
          }, 1200);
        } else {
          // Fallback: navigate to role list if no ID
          redirectTimer.current = window.setTimeout(() => {
            navigate('/roles', { replace: true });
          }, 1200);
        }
      } catch (submitError: any) {
        // Extract error message from API response
        const errorMessage =
          submitError?.response?.data?.message || 'Failed to create role.';
        setInlineMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, displayName, description, permissionsInput, isActive, createRole, navigate]
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create Role</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new role to the system
        </p>
      </div>

      {/* Create role form */}
      <form
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        {/* Form fields grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Name */}
          <div className="auth-field">
            <label className="label">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              placeholder="role_name (lowercase)"
              className="input"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Lowercase letters, numbers, and underscores only
            </p>
          </div>

          {/* Display Name */}
          <div className="auth-field">
            <label className="label">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Role Display Name"
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
            disabled={!canSubmit || createRole.isPending}
            className="btn-primary"
          >
            {isSubmitting || createRole.isPending
              ? 'Creating...'
              : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleAdd;
