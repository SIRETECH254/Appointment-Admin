import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiMail, FiUser, FiCalendar, FiClock, FiAlertTriangle, FiXCircle, FiTag } from 'react-icons/fi';
import { useGetSubscriberById } from '../../../tanstack/useNewsletters';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { IUser } from '../../../types/api.types';

/**
 * NewsletterDetails Component
 * 
 * Displays detailed information about a specific newsletter subscriber.
 * Shows subscriber info, subscription details, user info, and system information.
 * Provides Edit Status button for quick access to edit page.
 * 
 * Features:
 * - Subscriber header with email and status
 * - Subscriber details section
 * - Subscription details section
 * - User information section (if linked)
 * - System information section
 * - Edit action button
 * - Loading and error states
 */
const NewsletterDetails = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch subscriber data
  const { data, isLoading, isError, error } = useGetSubscriberById(id || '');

  // Extract subscriber from API response
  const subscriber = data?.subscriber;

  // Build user info for display
  const userInfo = useMemo(() => {
    if (!subscriber || !subscriber.userId) return null;
    if (typeof subscriber.userId === 'string') return null;
    return subscriber.userId as IUser;
  }, [subscriber]);

  // Get error message from API response
  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  /**
   * Format date for display
   */
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                <div className="h-6 w-48 animate-pulse rounded bg-gray-300" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Subscriber</h2>
          <p className="text-gray-600 mb-6 max-w-md">{errorMessage}</p>
          <Link to="/newsletters" className="btn-secondary">
            Back to Newsletters
          </Link>
        </div>
      </div>
    );
  }

  // No subscriber found
  if (!subscriber) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <FiXCircle className="mx-auto h-24 w-24 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscriber Not Found</h2>
          <p className="text-gray-600 mb-6">The subscriber you're looking for doesn't exist or has been removed.</p>
          <Link to="/newsletters" className="btn-secondary">
            Back to Newsletters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscriber header card: email, status, and primary actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Layout: stack on mobile, align items side-by-side on desktop */}
        <div className="flex flex-col gap-6 items-center justify-center">
          {/* Identity block: email + status + metadata */}
          <div className="flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-2xl font-semibold text-white">
              <FiMail className="h-8 w-8" />
            </div>
            <div>
              {/* Primary identity label */}
              <h1 className="text-xl font-semibold text-gray-900">
                {subscriber.email}
              </h1>
              {/* Status badge */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge 
                  status={subscriber.status} 
                  type="contact-status"
                />
              </div>
            </div>
          </div>

          {/* CTA block: edit action */}
          <div className="flex flex-wrap gap-3">
            {/* Primary CTA: navigate to edit form */}
            <Link to={`/newsletters/${subscriber._id}/edit`} className="btn-primary">
              Edit Status
            </Link>
            {/* Secondary CTA: back to list */}
            <Link to="/newsletters" className="btn-secondary">
              Back to Newsletters
            </Link>
          </div>
        </div>
      </div>

      {/* Subscriber Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiMail className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Subscriber Information</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiMail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Email</p>
              <p className="text-sm text-gray-700">{subscriber.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiTag className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Status</p>
              <StatusBadge 
                status={subscriber.status} 
                type="contact-status"
              />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiTag className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Source</p>
              <p className="text-sm text-gray-700">
                <span className="badge badge-soft">{subscriber.source}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Details Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">Subscription Details</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiCalendar className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Subscribed At</p>
              <p className="text-sm text-gray-700">
                {formatDate(subscriber.subscribedAt)}
              </p>
            </div>
          </div>
          {subscriber.unsubscribedAt && (
            <div className="flex items-start gap-3">
              <FiCalendar className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase text-gray-400 mb-1">Unsubscribed At</p>
                <p className="text-sm text-gray-700">
                  {formatDate(subscriber.unsubscribedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Information Section (if linked) */}
      {userInfo && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiUser className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FiUser className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase text-gray-400 mb-1">Linked User</p>
                <p className="text-sm text-gray-700">
                  {userInfo.firstName} {userInfo.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FiMail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase text-gray-400 mb-1">User Email</p>
                <p className="text-sm text-gray-700">
                  {userInfo.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiClock className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiClock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Created</p>
              <p className="text-sm text-gray-700">
                {formatDate(subscriber.createdAt)}
              </p>
            </div>
          </div>
          {subscriber.updatedAt && (
            <div className="flex items-start gap-3">
              <FiClock className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase text-gray-400 mb-1">Last Updated</p>
                <p className="text-sm text-gray-700">
                  {formatDate(subscriber.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterDetails;
