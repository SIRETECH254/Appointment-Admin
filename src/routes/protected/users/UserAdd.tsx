import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminCreateUser } from '../../../tanstack/useUsers';
import type { AdminCreateUserPayload } from '../../../types/api.types';

/**
 * Inline message type for form feedback
 */
type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

/**
 * Validate email format
 * Returns true if email is valid, false otherwise
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * UserAdd Component
 * 
 * Allows admin to create a new user account.
 * All required fields must be filled, and email must be unique.
 * 
 * Features:
 * - Form validation (required fields, email format, password length)
 * - Creates user via API
 * - Shows success/error feedback
 * - Navigates to user details on success
 */
const UserAdd = () => {
  const navigate = useNavigate();

  // TanStack Query hook
  const createUser = useAdminCreateUser();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

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
   * Requires all required fields, valid email, password length >= 6, and role selected
   */
  const canSubmit = useMemo(() => {
    return (
      Boolean(
        firstName.trim() &&
        lastName.trim() &&
        email.trim() &&
        password.trim() &&
        password.length >= 6 &&
        role
      ) && !isSubmitting
    );
  }, [firstName, lastName, email, password, role, isSubmitting]);

  /**
   * Handle form submission
   * Validates all fields, builds payload, and calls create mutation
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Trim all input values
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const trimmedPhone = phone.trim();

      // Client-side validation
      if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPassword) {
        setInlineMessage({
          type: 'error',
          text: 'All required fields must be filled.',
        });
        return;
      }

      // Validate email format
      if (!validateEmail(trimmedEmail)) {
        setInlineMessage({
          type: 'error',
          text: 'Please enter a valid email address.',
        });
        return;
      }

      // Validate password length
      if (trimmedPassword.length < 6) {
        setInlineMessage({
          type: 'error',
          text: 'Password must be at least 6 characters long.',
        });
        return;
      }

      // Validate role is selected
      if (!role) {
        setInlineMessage({
          type: 'error',
          text: 'Please select a role for the user.',
        });
        return;
      }

      setInlineMessage(null);
      setIsSubmitting(true);

      try {
        // Build create payload
        const userData: AdminCreateUserPayload = {
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          email: trimmedEmail,
          password: trimmedPassword,
        };

        // Add phone if provided
        if (trimmedPhone) {
          userData.phone = trimmedPhone;
        }

        // Call create mutation
        const result = await createUser.mutateAsync(userData);

        // Extract user ID from response (handle different response shapes)
        const createdUser = (result as any)?.user ?? result;
        const userId = createdUser?._id || (result as any)?._id;

        // Show success message
        setInlineMessage({
          type: 'success',
          text: 'User created successfully.',
        });

        // Navigate to user details page after delay
        if (userId) {
          redirectTimer.current = window.setTimeout(() => {
            navigate(`/users/${userId}`, { replace: true });
          }, 1200);
        } else {
          // Fallback: navigate to user list if no ID
          redirectTimer.current = window.setTimeout(() => {
            navigate('/users', { replace: true });
          }, 1200);
        }
      } catch (submitError: any) {
        // Extract error message from API response
        const errorMessage = submitError?.response?.data?.message ?? 'An error occurred';
        setInlineMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [firstName, lastName, email, password, phone, role, createUser, navigate]
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create User</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new user to the system
        </p>
      </div>

      {/* Create user form */}
      <form
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        {/* Form fields grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* First name */}
          <div className="auth-field">
            <label className="label">
              First Name <span className="text-red-500">*</span>
            </label>
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
            <label className="label">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="input"
              required
            />
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="label">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="input"
              required
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="label">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="input-password"
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters long
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
            <label className="label">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-select w-full"
              required
            >
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
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
            disabled={!canSubmit || createUser.isPending}
            className="btn-primary"
          >
            {isSubmitting || createUser.isPending
              ? 'Creating...'
              : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserAdd;
