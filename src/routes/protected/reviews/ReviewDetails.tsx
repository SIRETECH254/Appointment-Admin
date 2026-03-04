import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiUser, FiMail, FiClock, FiFileText, FiCalendar, FiAlertTriangle, FiXCircle, FiStar } from 'react-icons/fi';
import { useGetReviewById } from '../../../tanstack/useReviews';
import { formatReviewDateTime, getUserName, getUserInitials, getStaffName, getServiceNames, getAppointmentDate } from '../../../utils/reviewUtils';

/**
 * Star Rating Component
 * Displays a rating from 1-5 as filled/empty stars
 */
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          size={20}
        />
      ))}
      <span className="ml-2 text-lg font-semibold text-gray-700">{rating}</span>
    </div>
  );
};

/**
 * ReviewDetails Component
 * 
 * Displays detailed information about a specific review.
 * Shows user info, rating, comment, appointment details, and review status.
 * 
 * Features:
 * - Review header with user info, rating, and status
 * - Review information section
 * - User information section
 * - Appointment information section
 * - System information section
 * - Loading skeleton with animate-pulse divided into sections
 * - Error and not found states
 */
const ReviewDetails = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch review data
  const { data, isLoading, isError, error } = useGetReviewById(id || '');

  // Extract review from API response
  const review = data?.review;

  // Build user info for display
  const userName = useMemo(() => {
    if (!review) return 'Unknown User';
    return getUserName(review);
  }, [review]);

  const userInitials = useMemo(() => {
    if (!review) return 'U';
    return getUserInitials(review);
  }, [review]);

  const user = useMemo(() => {
    if (!review) return null;
    return typeof review.userId === 'object' ? review.userId : null;
  }, [review]);

  const staffName = useMemo(() => {
    if (!review) return 'Unknown Staff';
    return getStaffName(review);
  }, [review]);

  const serviceNames = useMemo(() => {
    if (!review) return [];
    return getServiceNames(review);
  }, [review]);

  const appointmentDate = useMemo(() => {
    if (!review) return '—';
    return getAppointmentDate(review);
  }, [review]);

  // Get error message from API response
  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  // Loading state with skeleton divided into sections
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
                <div className="h-5 w-24 animate-pulse rounded bg-gray-300" />
                <div className="h-6 w-32 animate-pulse rounded bg-gray-300" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-300" />
              <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-300" />
            </div>
          </div>
        </div>

        {/* Loading skeleton for review information section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-300 mb-4" />
          <div className="space-y-4">
            <div className="h-4 w-full animate-pulse rounded bg-gray-300" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300" />
            <div className="h-6 w-24 animate-pulse rounded bg-gray-300" />
          </div>
        </div>

        {/* Loading skeleton for user information section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-300 mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-300" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Loading skeleton for appointment information section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-300 mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-300" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Loading skeleton for system information section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-300 mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, index) => (
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Review</h2>
          <p className="text-gray-600 mb-6 max-w-md">{errorMessage}</p>
          <Link to="/reviews" className="btn-secondary">
            Back to Reviews
          </Link>
        </div>
      </div>
    );
  }

  // No review found
  if (!review) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <FiXCircle className="mx-auto h-24 w-24 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Review Not Found</h2>
          <p className="text-gray-600 mb-6">The review you're looking for doesn't exist or has been removed.</p>
          <Link to="/reviews" className="btn-secondary">
            Back to Reviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review header card: user info, rating, status, and primary actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Layout: stack on mobile, align items side-by-side on desktop */}
        <div className="flex flex-col gap-6 items-center justify-center">
          {/* Identity block: avatar + user name + rating */}
          <div className="flex flex-col items-center gap-4">
            {user?.avatar ? (
              // Server-hosted avatar image when available
              <img
                src={user.avatar}
                alt={`${userName} avatar`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              // Initials badge fallback when avatar is missing
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-xl font-semibold text-white">
                {userInitials}
              </div>
            )}
            <div className="text-center">
              {/* Primary identity label */}
              <h1 className="text-xl font-semibold text-gray-900">
                {userName}
              </h1>
              {/* Rating display */}
              <div className="mt-3 flex justify-center">
                <StarRating rating={review.rating} />
              </div>
              {/* Status badge */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                {review.status === 'APPROVED' && (
                  <span className="badge badge-success">Approved</span>
                )}
                {review.status === 'PENDING' && (
                  <span className="badge badge-soft">Pending</span>
                )}
                {review.status === 'REJECTED' && (
                  <span className="badge badge-error">Rejected</span>
                )}
              </div>
            </div>
          </div>

          {/* CTA block: back to list */}
          <div className="flex flex-wrap gap-3">
            {/* Secondary CTA: back to list */}
            <Link to="/reviews" className="btn-secondary">
              Back to Reviews
            </Link>
          </div>
        </div>
      </div>

      {/* Review Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiFileText className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Review Information</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiStar className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Rating</p>
              <StarRating rating={review.rating} />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiFileText className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Comment</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {review.comment || '—'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiFileText className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Status</p>
              <div>
                {review.status === 'APPROVED' && (
                  <span className="badge badge-success">Approved</span>
                )}
                {review.status === 'PENDING' && (
                  <span className="badge badge-soft">Pending</span>
                )}
                {review.status === 'REJECTED' && (
                  <span className="badge badge-error">Rejected</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiUser className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiUser className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">User Name</p>
              <p className="text-sm text-gray-700">{userName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiMail className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">User Email</p>
              <p className="text-sm text-gray-700">
                {user?.email || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">Appointment Information</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiUser className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Staff</p>
              <p className="text-sm text-gray-700">{staffName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiFileText className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Services</p>
              <p className="text-sm text-gray-700">
                {serviceNames.length > 0 ? serviceNames.join(', ') : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiClock className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Appointment Date</p>
              <p className="text-sm text-gray-700">{appointmentDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiCalendar className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Created</p>
              <p className="text-sm text-gray-700">
                {formatReviewDateTime(review.createdAt)}
              </p>
            </div>
          </div>
          {review.updatedAt && (
            <div className="flex items-start gap-3">
              <FiCalendar className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase text-gray-400 mb-1">Last Updated</p>
                <p className="text-sm text-gray-700">
                  {formatReviewDateTime(review.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDetails;
