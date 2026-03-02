import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateBreak } from '../../../tanstack/useBreaks';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import { isTimeBefore } from '../../../utils/breakUtils';
import type { CreateBreakPayload, IUser } from '../../../types/api.types';

/**
 * Inline message type for form feedback
 */
type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

/**
 * BreakAdd Component
 * 
 * Allows admin to create a new break schedule for staff.
 * All required fields must be filled, and start time must be before end time.
 * 
 * Features:
 * - Form validation (required fields, time validation)
 * - Creates break via API
 * - Shows success/error feedback
 * - Navigates to break details on success
 */
const BreakAdd = () => {
  const navigate = useNavigate();

  // TanStack Query hooks
  const createBreak = useCreateBreak();
  const { data: staffData } = useGetAllUsers({ role: 'staff' });
  const staffUsers = (staffData as any)?.users || [];

  // Form state
  const [staffId, setStaffId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');

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
   * Requires all required fields, valid time range, and reason length check
   */
  const canSubmit = useMemo(() => {
    if (!staffId || !startTime || !endTime) return false;
    if (isSubmitting) return false;
    
    // Validate time format (HH:MM)
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(startTime) || !timePattern.test(endTime)) return false;
    
    // Validate that start time is before end time
    if (!isTimeBefore(startTime, endTime)) return false;
    
    if (reason && reason.length > 300) return false;
    
    return true;
  }, [staffId, startTime, endTime, reason, isSubmitting]);

  /**
   * Handle form submission
   * Validates all fields, builds payload, and calls create mutation
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Client-side validation
      if (!staffId || !startTime || !endTime) {
        setInlineMessage({
          type: 'error',
          text: 'All required fields must be filled.',
        });
        return;
      }

      // Validate time format (HH:MM)
      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
        setInlineMessage({
          type: 'error',
          text: 'Please enter valid times in HH:MM format.',
        });
        return;
      }

      // Validate time range
      if (!isTimeBefore(startTime, endTime)) {
        setInlineMessage({
          type: 'error',
          text: 'Start time must be earlier than end time.',
        });
        return;
      }

      // Validate reason length
      if (reason && reason.trim().length > 300) {
        setInlineMessage({
          type: 'error',
          text: 'Reason must be 300 characters or less.',
        });
        return;
      }

      setInlineMessage(null);
      setIsSubmitting(true);

      try {
        // Build create payload with HH:MM format
        const breakData: CreateBreakPayload = {
          staffId,
          startTime: startTime.trim(),
          endTime: endTime.trim(),
        };

        // Add reason if provided
        if (reason.trim()) {
          breakData.reason = reason.trim();
        }

        // Call create mutation
        const result = await createBreak.mutateAsync(breakData);

        // Extract break ID from response (handle different response shapes)
        const createdBreak = (result as any)?.break ?? result;
        const breakId = createdBreak?._id || (result as any)?._id;

        // Show success message
        setInlineMessage({
          type: 'success',
          text: 'Break created successfully.',
        });

        // Navigate to break details page after delay
        if (breakId) {
          redirectTimer.current = window.setTimeout(() => {
            navigate(`/breaks/${breakId}`, { replace: true });
          }, 1200);
        } else {
          // Fallback: navigate to break list if no ID
          redirectTimer.current = window.setTimeout(() => {
            navigate('/breaks', { replace: true });
          }, 1200);
        }
      } catch (submitError: any) {
        // Extract error message from API response
        const errorMessage =
          submitError?.response?.data?.message || 'Failed to create break.';
        setInlineMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [staffId, startTime, endTime, reason, createBreak, navigate]
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create Break</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new break schedule for staff
        </p>
      </div>

      {/* Create break form */}
      <form
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        {/* Form fields grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Staff */}
          <div className="auth-field">
            <label className="label">
              Staff <span className="text-red-500">*</span>
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="input-select w-full"
              required
            >
              <option value="">Select staff</option>
              {staffUsers.map((staff: IUser) => (
                <option key={staff._id} value={staff._id}>
                  {staff.firstName} {staff.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div className="auth-field">
            <label className="label">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Break applies to all days when staff has working hours
            </p>
          </div>

          {/* End Time */}
          <div className="auth-field">
            <label className="label">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Break applies to all days when staff has working hours
            </p>
          </div>

          {/* Reason */}
          <div className="auth-field md:col-span-2">
            <label className="label">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional reason for the break"
              className="input"
              rows={3}
              maxLength={300}
            />
            <p className="mt-1 text-xs text-gray-500">
              {reason.length}/300 characters
            </p>
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
          <Link to="/breaks" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!canSubmit || createBreak.isPending}
            className="btn-primary"
          >
            {isSubmitting || createBreak.isPending
              ? 'Creating...'
              : 'Create Break'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BreakAdd;
