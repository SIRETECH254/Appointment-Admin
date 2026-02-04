import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetBreakById, useUpdateBreak } from '../../../tanstack/useBreaks';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import { formatDateTimeLocal } from '../../../utils/breakUtils';
import type { IBreak, IUser, UpdateBreakPayload } from '../../../types/api.types';

/**
 * Inline message type for form feedback
 */
type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

/**
 * BreakEdit Component
 * 
 * Allows admin to edit break information including staff, times, and reason.
 * 
 * Features:
 * - Pre-populates form from fetched break data
 * - Validates required fields and time validation
 * - Updates break via API
 * - Shows success/error feedback
 * - Navigates on success
 */
const BreakEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TanStack Query hooks
  const { data, isLoading, isError, error } = useGetBreakById(id || '');
  const updateBreak = useUpdateBreak();
  const { data: staffData } = useGetAllUsers({ role: 'staff' });
  const staffUsers = (staffData as any)?.users || [];

  // Extract break from API response (handle different response shapes)
  const breakItem = (data as any)?.break ?? (data as IBreak);

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
   * Hydrate form fields from fetched break data
   * Runs when break data is loaded or changes
   */
  useEffect(() => {
    if (!breakItem) return;

    // Extract staff ID (handle both string and populated object)
    const staffIdValue = typeof breakItem.staffId === 'string' 
      ? breakItem.staffId 
      : breakItem.staffId._id;
    setStaffId(staffIdValue);

    // Convert ISO strings to datetime-local format
    const startDate = new Date(breakItem.startTime);
    const endDate = new Date(breakItem.endTime);
    setStartTime(formatDateTimeLocal(startDate));
    setEndTime(formatDateTimeLocal(endDate));

    setReason(breakItem.reason || '');
  }, [breakItem]);

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
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) return false;
    
    if (reason && reason.length > 300) return false;
    
    return true;
  }, [staffId, startTime, endTime, reason, isSubmitting]);

  /**
   * Handle form submission
   * Validates fields, builds payload, and calls update mutation
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

      const start = new Date(startTime);
      const end = new Date(endTime);

      // Validate time range
      if (start >= end) {
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
        // Build update payload
        const breakData: UpdateBreakPayload = {
          staffId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        };

        // Add reason if provided or set to undefined if empty
        if (reason.trim()) {
          breakData.reason = reason.trim();
        } else {
          breakData.reason = undefined;
        }

        // Call update mutation
        await updateBreak.mutateAsync({
          breakId: id!,
          breakData,
        });

        // Show success message
        setInlineMessage({
          type: 'success',
          text: 'Break updated successfully.',
        });

        // Navigate back to break list after delay
        redirectTimer.current = window.setTimeout(() => {
          navigate('/breaks', { replace: true });
        }, 1200);
      } catch (submitError: any) {
        // Extract error message from API response
        const errorMessage =
          submitError?.response?.data?.message || 'Failed to update break.';
        setInlineMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [staffId, startTime, endTime, reason, id, updateBreak, navigate]
  );

  // Get error message from API response
  const errorMessage =
    (error as any)?.response?.data?.message || 'Failed to load break.';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">
        Loading break...
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="alert-error">{errorMessage}</div>
        <Link to="/breaks" className="btn-secondary">
          Back to Breaks
        </Link>
      </div>
    );
  }

  // No break found
  if (!breakItem) {
    return (
      <div className="space-y-4">
        <div className="alert-error">Break not found.</div>
        <Link to="/breaks" className="btn-secondary">
          Back to Breaks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Break</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update break schedule information
        </p>
      </div>

      {/* Edit break form */}
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
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input"
              required
            />
          </div>

          {/* End Time */}
          <div className="auth-field">
            <label className="label">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input"
              required
            />
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
            disabled={!canSubmit || updateBreak.isPending}
            className="btn-primary"
          >
            {isSubmitting || updateBreak.isPending
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BreakEdit;
