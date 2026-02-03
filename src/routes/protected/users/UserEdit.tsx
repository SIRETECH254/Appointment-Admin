import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetUserById, useUpdateUser } from '../../../tanstack/useUsers';
import type { IUser } from '../../../types/api.types';

/**
 * Inline message type for form feedback
 */
type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

/**
 * UserEdit Component
 * 
 * Allows admin to edit user information including name, phone, role, and active status.
 * Email is displayed as read-only since it's a unique identifier.
 * 
 * Features:
 * - Pre-populates form from fetched user data
 * - Validates required fields
 * - Updates user via API
 * - Shows success/error feedback
 * - Navigates on success
 */
const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TanStack Query hooks
  const { data, isLoading, isError, error } = useGetUserById(id || '');
  const updateUser = useUpdateUser();

  // Extract user from API response (handle different response shapes)
  const user = (data as any)?.user ?? (data as IUser);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);

  // UI state
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect timer ref for cleanup
  const redirectTimer = useRef<number | null>(null);

  /**
   * Hydrate form fields from fetched user data
   * Runs when user data is loaded or changes
   */
  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setEmail(user.email ?? '');
    setPhone(user.phone ?? '');
    // Get primary role (first role in array)
    setRole(user.roles?.[0]?.name ?? '');
    setIsActive(user.isActive ?? true);
  }, [user]);

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
   * Requires firstName and lastName, and not currently submitting
   */
  const canSubmit = useMemo(() => {
    return Boolean(firstName.trim() && lastName.trim()) && !isSubmitting;
  }, [firstName, lastName, isSubmitting]);

  /**
   * Handle form submission
   * Validates fields, builds payload, and calls update mutation
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Client-side validation
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const trimmedPhone = phone.trim();

      if (!trimmedFirstName || !trimmedLastName) {
        setInlineMessage({
          type: 'error',
          text: 'First name and last name are required.',
        });
        return;
      }

      setInlineMessage(null);
      setIsSubmitting(true);

      try {
        // Build update payload
        const userData: any = {
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
        };

        // Add optional fields if provided
        if (trimmedPhone) {
          userData.phone = trimmedPhone;
        }

        // Add role if selected (may need to be handled via role assignment endpoint)
        if (role) {
          userData.role = role;
        }

        // Add active status
        userData.isActive = isActive;

        // Call update mutation
        await updateUser.mutateAsync({
          userId: id!,
          userData,
        });

        // Show success message
        setInlineMessage({
          type: 'success',
          text: 'User updated successfully.',
        });

        // Navigate back to user list after delay
        redirectTimer.current = window.setTimeout(() => {
          navigate('/users', { replace: true });
        }, 1200);
      } catch (submitError: any) {
        // Extract error message from API response
        const errorMessage =
          submitError?.response?.data?.message || 'Failed to update user.';
        setInlineMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [firstName, lastName, phone, role, isActive, id, updateUser, navigate]
  );

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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit User</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update user information and permissions
        </p>
      </div>

      {/* Edit user form */}
      <form
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        {/* Form fields grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* First name */}
          <div className="auth-field">
            <label className="label">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="input"
              required
            />
          </div>

          {/* Last name */}
          <div className="auth-field">
            <label className="label">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="input"
              required
            />
          </div>

          {/* Email (read-only) */}
          <div className="auth-field">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="input-disabled"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email cannot be changed
            </p>
          </div>

          {/* Phone */}
          <div className="auth-field">
            <label className="label">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="input"
            />
          </div>

          {/* Role */}
          <div className="auth-field">
            <label className="label">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-select w-full"
            >
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
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
                Active user account
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
          <Link to="/users" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!canSubmit || updateUser.isPending}
            className="btn-primary"
          >
            {isSubmitting || updateUser.isPending
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;
