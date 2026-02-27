import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiUser, FiMail, FiClock, FiFileText, FiCalendar, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import { useGetBreakById } from '../../../tanstack/useBreaks';
import { formatBreakDateTime, formatBreakTimeRange, formatFullDateTime, getStaffName, getStaffInitials } from '../../../utils/breakUtils';
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
      <div className="space-y-6">
        {/* Loading skeleton for header card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 animate-pulse rounded-full bg-gray-300" />
              <div className="space-y-2">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-300" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-300" />
                <div className="h-5 w-24 animate-pulse rounded bg-gray-300" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-300" />
              <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-300" />
            </div>
          </div>
        </div>

        {/* Loading skeleton for details card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-300 mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-300" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <FiAlertTriangle className="mx-auto h-24 w-24 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Break</h2>
          <p className="text-gray-600 mb-6 max-w-md">{errorMessage}</p>
          <Link to="/breaks" className="btn-secondary">
            Back to Breaks
          </Link>
        </div>
      </div>
    );
  }

  // No break found
  if (!breakItem) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <FiXCircle className="mx-auto h-24 w-24 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Break Not Found</h2>
          <p className="text-gray-600 mb-6">The break you're looking for doesn't exist or has been removed.</p>
          <Link to="/breaks" className="btn-secondary">
            Back to Breaks
          </Link>
        </div>
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
          <div className="flex-col items-center gap-4">
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
          <div className="flex items-start gap-3">
            <FiUser className="mt-1 h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs uppercase text-gray-400">Staff</p>
              <p className="text-sm text-gray-700">{staffName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiMail className="mt-1 h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs uppercase text-gray-400">Staff Email</p>
              <p className="text-sm text-gray-700">
                {staffUser?.email || '—'}
              </p>
            </div>
          </div>

          {/* Time Information Section */}
          <div className="flex items-start gap-3">
            <FiClock className="mt-1 h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs uppercase text-gray-400">Start Time</p>
              <p className="text-sm text-gray-700">
                {formatBreakDateTime(breakItem.startTime)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiClock className="mt-1 h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs uppercase text-gray-400">End Time</p>
              <p className="text-sm text-gray-700">
                {formatBreakDateTime(breakItem.endTime)}
              </p>
            </div>
          </div>

          {/* Reason Section */}
          <div className="flex items-start gap-3">
            <FiFileText className="mt-1 h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs uppercase text-gray-400">Reason</p>
              <p className="text-sm text-gray-700">
                {breakItem.reason || '—'}
              </p>
            </div>
          </div>

          {/* Timestamps Section */}
          <div className="flex items-start gap-3">
            <FiCalendar className="mt-1 h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs uppercase text-gray-400">Created</p>
              <p className="text-sm text-gray-700">
                {formatFullDateTime(breakItem.createdAt)}
              </p>
            </div>
          </div>
          {breakItem.updatedAt && (
            <div className="flex items-start gap-3">
              <FiCalendar className="mt-1 h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs uppercase text-gray-400">Last Updated</p>
                <p className="text-sm text-gray-700">
                  {formatFullDateTime(breakItem.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakDetails;
