import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiClock, FiPlus, FiX } from 'react-icons/fi';
import { useGetUserById, useUpdateUser } from '../../../tanstack/useUsers';
import { useGetAllRoles } from '../../../tanstack/useRoles';
import type { IUser, IRole } from '../../../types/api.types';
import MultiSelect from '../../../components/ui/MultiSelect';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const formatDayName = (day: string): string => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

type WorkingHours = {
  [key: string]: { start: string; end: string }[];
};

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
 * Allows admin to edit user information including name, phone, roles, working hours and active status.
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
  const { data: rolesData } = useGetAllRoles();

  const allRoles = (rolesData as any)?.roles || [];

  // Extract user from API response (handle different response shapes)
  const user = (data as any)?.user ?? (data as IUser);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({});
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
    setSelectedRoles(user.roles?.map((r: IRole) => r._id) ?? []);
    setWorkingHours(user.workingHours ?? {});
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

  const isStaff = useMemo(() => {
    const staffRole = allRoles.find((r: IRole) => r.name === 'staff');
    return staffRole && selectedRoles.includes(staffRole._id);
  }, [selectedRoles, allRoles]);

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
          roles: selectedRoles,
          isActive,
        };

        if (trimmedPhone) {
          userData.phone = trimmedPhone;
        }

        if (isStaff) {
          userData.workingHours = workingHours;
        }

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
    [firstName, lastName, phone, selectedRoles, isActive, id, updateUser, navigate, isStaff, workingHours]
  );

  // Get error message from API response
  const errorMessage =
    (error as any)?.response?.data?.message || 'Failed to load user.';

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-300 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-300 rounded" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-300 rounded" />
                <div className="h-10 w-full bg-gray-300 rounded" />
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

  const roleOptions = allRoles.map((r: IRole) => ({
    value: r._id,
    label: r.displayName,
  }));

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

          {/* Roles */}
          <div className="auth-field md:col-span-2">
            <MultiSelect
              label="Roles"
              options={roleOptions}
              selected={selectedRoles}
              onChange={setSelectedRoles}
            />
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

        {isStaff && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <FiClock className="h-5 w-5 text-teal-600" />
              <h3 className="text-md font-semibold text-gray-900">Working Hours</h3>
            </div>
            <div className="space-y-4">
              {DAYS.map((day) => {
                const dayHours = workingHours[day] || [];
                return (
                  <div key={day} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {formatDayName(day)}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newWorkingHours = { ...workingHours };
                          if (!newWorkingHours[day]) {
                            newWorkingHours[day] = [];
                          }
                          newWorkingHours[day].push({ start: '09:00', end: '17:00' });
                          setWorkingHours(newWorkingHours);
                        }}
                        className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-accent transition"
                      >
                        <FiPlus className="h-3 w-3" />
                        Add Slot
                      </button>
                    </div>
                    {dayHours.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No working hours set</p>
                    ) : (
                      <div className="space-y-2">
                        {dayHours.map((slot, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => {
                                const newWorkingHours = { ...workingHours };
                                newWorkingHours[day][index].start = e.target.value;
                                setWorkingHours(newWorkingHours);
                              }}
                              className="input flex-1"
                            />
                            <span className="text-sm text-gray-500">to</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => {
                                const newWorkingHours = { ...workingHours };
                                newWorkingHours[day][index].end = e.target.value;
                                setWorkingHours(newWorkingHours);
                              }}
                              className="input flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newWorkingHours = { ...workingHours };
                                newWorkingHours[day].splice(index, 1);
                                if (newWorkingHours[day].length === 0) {
                                  delete newWorkingHours[day];
                                }
                                setWorkingHours(newWorkingHours);
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
