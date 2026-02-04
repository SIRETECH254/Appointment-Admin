import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetBreakById } from '../../../tanstack/useBreaks';
import { formatBreakDateTime, formatBreakTimeRange, getStaffName, getStaffInitials } from '../../../utils/breakUtils';
import type { IBreak } from '../../../types/api.types';

/**
 * BreakDetails Component
 * 
 * Displays detailed information about a specific break.
 * Shows staff info, time range, reason, and break details.
 * Provides Edit button for quick access to edit page.
 * 
 * Features:
 * - Break header with staff info and time range
 * - Break details section
 * - Edit action button
 * - Loading and error states
 */
const BreakDetails = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch break data
  const { data, isLoading, isError, error } = useGetBreakById(id || '');

  // Extract break from API response (handle different response shapes)
  const breakItem = (data as any)?.break ?? (data as IBreak);

  // Build staff info for display
  const staffName = useMemo(() => {
    if (!breakItem) return 'Unknown Staff';
    return getStaffName(breakItem);
  }, [breakItem]);

  const staffInitials = useMemo(() => {
    if (!breakItem) return 'U';
    return getStaffInitials(breakItem);
  }, [breakItem]);

  const staffUser = useMemo(() => {
    if (!breakItem) return null;
    return typeof breakItem.staffId === 'object' ? breakItem.staffId : null;
  }, [breakItem]);

  const timeRange = useMemo(() => {
    if (!breakItem) return '—';
    return formatBreakTimeRange(breakItem.startTime, breakItem.endTime);
  }, [breakItem]);

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
      {/* Break header card: staff info, time range, and primary actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Layout: stack on mobile, align items side-by-side on desktop */}
        <div className="flex flex-col gap-6 items-center justify-center">
          {/* Identity block: avatar + staff name + metadata */}
          <div className="flex items-center gap-4">
            {staffUser?.avatar ? (
              // Server-hosted avatar image when available
              <img
                src={staffUser.avatar}
                alt={`${staffName} avatar`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              // Initials badge fallback when avatar is missing
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-xl font-semibold text-white">
                {staffInitials}
              </div>
            )}
            <div>
              {/* Primary identity label */}
              <h1 className="text-xl font-semibold text-gray-900">
                {staffName}
              </h1>
              {/* Time range label */}
              <p className="text-sm text-gray-500">{timeRange}</p>
              {/* Reason badge */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {breakItem.reason ? (
                  <span className="badge badge-soft">{breakItem.reason}</span>
                ) : (
                  <span className="text-gray-400">No reason provided</span>
                )}
              </div>
            </div>
          </div>

          {/* CTA block: edit action */}
          <div className="flex flex-wrap gap-3">
            {/* Primary CTA: navigate to edit form */}
            <Link to={`/breaks/${breakItem._id}/edit`} className="btn-primary">
              Edit Break
            </Link>
            {/* Secondary CTA: back to list */}
            <Link to="/breaks" className="btn-secondary">
              Back to Breaks
            </Link>
          </div>
        </div>
      </div>

      {/* Break details card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Section title */}
        <h2 className="text-lg font-semibold text-gray-900">
          Break Details
        </h2>
        {/* Two-column grid on desktop for compact layout */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Staff Information Section */}
          <div>
            <p className="text-xs uppercase text-gray-400">Staff</p>
            <p className="text-sm text-gray-700">{staffName}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">Staff Email</p>
            <p className="text-sm text-gray-700">
              {staffUser?.email || '—'}
            </p>
          </div>

          {/* Time Information Section */}
          <div>
            <p className="text-xs uppercase text-gray-400">Start Time</p>
            <p className="text-sm text-gray-700">
              {formatBreakDateTime(breakItem.startTime)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400">End Time</p>
            <p className="text-sm text-gray-700">
              {formatBreakDateTime(breakItem.endTime)}
            </p>
          </div>

          {/* Reason Section */}
          <div>
            <p className="text-xs uppercase text-gray-400">Reason</p>
            <p className="text-sm text-gray-700">
              {breakItem.reason || '—'}
            </p>
          </div>

          {/* Timestamps Section */}
          <div>
            <p className="text-xs uppercase text-gray-400">Created</p>
            <p className="text-sm text-gray-700">
              {formatBreakDateTime(breakItem.createdAt)}
            </p>
          </div>
          {breakItem.updatedAt && (
            <div>
              <p className="text-xs uppercase text-gray-400">Last Updated</p>
              <p className="text-sm text-gray-700">
                {formatBreakDateTime(breakItem.updatedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakDetails;
