import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFilter, FiList, FiSearch, FiEye, FiEdit2, FiTrash2, FiStar } from 'react-icons/fi';
import { useGetAllReviews, useDeleteReview, useUpdateReviewStatus } from '../../../tanstack/useReviews';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import { useGetAllServices } from '../../../tanstack/useServices';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { formatReviewDate, getUserName, getUserInitials, getStaffName, getServiceNames } from '../../../utils/reviewUtils';
import type { IReview, IUser, ReviewStatus } from '../../../types/api.types';

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
          size={16}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating}</span>
    </div>
  );
};

/**
 * ReviewList Component
 * 
 * Displays a paginated table of all reviews with search, filtering, and CRUD actions.
 * Features:
 * - Search by user name, comment, or rating
 * - Filter by status, staff, service, and rating
 * - Pagination controls
 * - View, Edit, Delete, and Status Update actions per review
 * - Loading skeleton, error, and empty states
 */
const ReviewList = () => {
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Status update modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [reviewToUpdateStatus, setReviewToUpdateStatus] = useState<{
    id: string;
    currentStatus: ReviewStatus;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<ReviewStatus>('APPROVED');

  // TanStack Query hooks
  const deleteReview = useDeleteReview();
  const updateReviewStatus = useUpdateReviewStatus();

  // Fetch staff users and services for filter dropdowns
  const { data: staffData } = useGetAllUsers({ role: 'staff' });
  const staffUsers = (staffData as any)?.users || [];

  const { data: servicesData } = useGetAllServices();
  const services = (servicesData as any)?.services || [];

  /**
   * Debounce search input to reduce API calls
   * Updates debouncedSearch after 500ms of no typing
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      // Reset to page 1 when search changes
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * Build API params from filters, search, and pagination
   * Memoized to prevent unnecessary API calls
   */
  const params = useMemo(() => {
    const apiParams: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add search if provided
    if (debouncedSearch.trim()) {
      apiParams.search = debouncedSearch.trim();
    }

    // Add status filter if not "all"
    if (filterStatus !== 'all') {
      apiParams.status = filterStatus;
    }

    // Add staff filter if not "all"
    if (filterStaff !== 'all') {
      apiParams.staffId = filterStaff;
    }

    // Add service filter if not "all"
    if (filterService !== 'all') {
      apiParams.serviceId = filterService;
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, filterStaff, filterService, currentPage, itemsPerPage]);

  // Fetch reviews with current params
  const { data, isLoading, isError, error } = useGetAllReviews(params);

  // Extract reviews and pagination from API response
  const reviews = (data as any)?.reviews || [];
  const paginationData = (data as any)?.pagination || {};
  
  // Map backend pagination structure to component expectations
  const pagination = {
    page: paginationData.currentPage || 1,
    limit: itemsPerPage,
    total: paginationData.totalReviews || 0,
    totalPages: paginationData.totalPages || 1,
  };

  /**
   * Open delete confirmation modal
   * Sets the review to delete and opens the modal
   */
  const handleDeleteClick = useCallback((reviewId: string, userName: string) => {
    setReviewToDelete({ id: reviewId, name: userName });
    setDeleteModalOpen(true);
  }, []);

  /**
   * Close delete confirmation modal
   * Clears the review to delete and closes the modal
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setReviewToDelete(null);
  }, []);

  /**
   * Confirm and execute review deletion
   * Calls the delete mutation and closes modal on success
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!reviewToDelete) return;

    try {
      await deleteReview.mutateAsync(reviewToDelete.id);
      // Close modal on success
      setDeleteModalOpen(false);
      setReviewToDelete(null);
      // Cache invalidation handled by mutation onSuccess
    } catch (deleteError) {
      // Error handling is done in mutation's onError callback
      console.error('Delete review error:', deleteError);
      // Keep modal open on error so user can retry
    }
  }, [reviewToDelete, deleteReview]);

  /**
   * Open status update modal
   */
  const handleStatusClick = useCallback((reviewId: string, currentStatus: ReviewStatus) => {
    setReviewToUpdateStatus({ id: reviewId, currentStatus });
    setNewStatus(currentStatus);
    setStatusModalOpen(true);
  }, []);

  /**
   * Close status update modal
   */
  const handleStatusCancel = useCallback(() => {
    setStatusModalOpen(false);
    setReviewToUpdateStatus(null);
  }, []);

  /**
   * Confirm and execute status update
   */
  const handleStatusConfirm = useCallback(async () => {
    if (!reviewToUpdateStatus) return;

    try {
      await updateReviewStatus.mutateAsync({
        reviewId: reviewToUpdateStatus.id,
        statusData: { status: newStatus },
      });
      // Close modal on success
      setStatusModalOpen(false);
      setReviewToUpdateStatus(null);
    } catch (statusError) {
      console.error('Update review status error:', statusError);
    }
  }, [reviewToUpdateStatus, newStatus, updateReviewStatus]);

  /**
   * Handle filter changes
   * Resets to page 1 when filters change
   */
  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleStaffFilterChange = (value: string) => {
    setFilterStaff(value);
    setCurrentPage(1);
  };

  const handleServiceFilterChange = (value: string) => {
    setFilterService(value);
    setCurrentPage(1);
  };

  const handleRatingFilterChange = (value: string) => {
    setFilterRating(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  /**
   * Get error message from API response
   */
  const errorMessage =
    (error as any)?.response?.data?.message || 'Failed to load reviews.';

  return (
    <div className="space-y-6">
      {/* Page header with title */}
      <header className="">
        {/* title and description */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer reviews and ratings
          </p>
        </div>

        {/* search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search input */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reviews..."
                className="input-search"
              />
            </div>
          </div>
        </div>

        {/* review count & filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* review count */}
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.total} reviews</p>
          </div>
           
          {/* filters */}
          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Staff filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterStaff}
                onChange={(e) => handleStaffFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Staff</option>
                {staffUsers.map((staff: IUser) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.firstName} {staff.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Service filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterService}
                onChange={(e) => handleServiceFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Services</option>
                {services.map((service: any) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={filterRating}
                onChange={(e) => handleRatingFilterChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Items per page */}
            <div className="relative">
              <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="input-select pl-10"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Reviews table */}
      <div className="table-container">
        <table className="table">
          {/* Table header */}
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">
                User
              </th>
              <th className="table-header-cell">
                Appointment Info
              </th>
              <th className="table-header-cell">
                Rating
              </th>
              <th className="table-header-cell">
                Comment
              </th>
              <th className="table-header-cell">
                Status
              </th>
              <th className="table-header-cell">
                Created
              </th>
              <th className="table-header-cell-right">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="table-body">
            {/* Loading state: skeleton rows */}
            {isLoading && (
              <>
                {[...Array(5)].map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="table-cell">
                      <div className="table-cell-content">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300" />
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-48 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-6 w-20 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-300" />
                        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-300" />
                        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-300" />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <tr>
                <td colSpan={7} className="table-cell-center">
                  <div className="alert-error mx-auto max-w-md">{errorMessage}</div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && reviews.length === 0 && (
              <tr>
                <td colSpan={7} className="table-cell-center">
                  <p className="text-gray-500">No reviews found.</p>
                  {debouncedSearch || filterStatus !== 'all' || filterStaff !== 'all' || filterService !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search or filters.
                    </p>
                  ) : null}
                </td>
              </tr>
            )}

            {/* Review rows */}
            {!isLoading &&
              !isError &&
              reviews.map((review: IReview) => {
                const userName = getUserName(review);
                const userInitials = getUserInitials(review);
                const user = typeof review.userId === 'object' ? review.userId : null;
                const staffName = getStaffName(review);
                const serviceNames = getServiceNames(review);
                const serviceNamesText = serviceNames.length > 0 ? serviceNames.join(', ') : '—';

                return (
                  <tr
                    key={review._id}
                    className="table-row"
                  >
                    {/* User */}
                    <td className="table-cell">
                      <div className="table-cell-content">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={userName}
                            className="table-avatar"
                          />
                        ) : (
                          <div className="table-avatar-initials">
                            {userInitials}
                          </div>
                        )}
                        <div className="font-medium text-gray-900 whitespace-nowrap">
                          {userName}
                        </div>
                      </div>
                    </td>

                    {/* Appointment Info */}
                    <td className="table-cell-text">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{staffName}</div>
                        <div className="text-xs text-gray-500">{serviceNamesText}</div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="table-cell">
                      <StarRating rating={review.rating} />
                    </td>

                    {/* Comment */}
                    <td className="table-cell-text">
                      <div className="max-w-xs truncate" title={review.comment || '—'}>
                        {review.comment || '—'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="table-cell">
                      {review.status === 'APPROVED' && (
                        <span className="badge badge-success">Approved</span>
                      )}
                      {review.status === 'PENDING' && (
                        <span className="badge badge-soft">Pending</span>
                      )}
                      {review.status === 'REJECTED' && (
                        <span className="badge badge-error">Rejected</span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="table-cell-text">
                      {formatReviewDate(review.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/reviews/${review._id}`}
                          className="flex items-center justify-center rounded-lg bg-white p-2 text-blue-600 transition hover:bg-blue-50"
                          title="View review"
                        >
                          <FiEye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleStatusClick(review._id, review.status)}
                          className="flex items-center justify-center rounded-lg bg-white p-2 text-purple-600 transition hover:bg-purple-50 disabled:opacity-50"
                          title="Update status"
                          disabled={updateReviewStatus.isPending}
                        >
                          <FiFilter className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(review._id, userName)
                          }
                          className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          title="Delete review"
                          disabled={deleteReview.isPending}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination - separate from table container */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Review"
        message={
          reviewToDelete
            ? `Are you sure you want to delete the review by "${reviewToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this review? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteReview.isPending}
      />

      {/* Status update modal - custom implementation */}
      {statusModalOpen && reviewToUpdateStatus && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !updateReviewStatus.isPending) {
              handleStatusCancel();
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-[90%] md:w-[70%] lg:w-[60%] rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Update Review Status
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Current status: <span className="font-semibold">{reviewToUpdateStatus.currentStatus}</span>
            </p>
            <div className="mb-6">
              <label className="label mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReviewStatus)}
                className="input-select w-full"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleStatusCancel}
                className="btn-secondary"
                disabled={updateReviewStatus.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusConfirm}
                className="btn-primary"
                disabled={updateReviewStatus.isPending}
              >
                {updateReviewStatus.isPending ? 'Processing...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
