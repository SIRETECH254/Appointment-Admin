import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdSend } from 'react-icons/md';
import { FiFilter, FiList, FiSearch, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useGetAllSubscribers, useDeleteSubscriber } from '../../../tanstack/useNewsletters';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StatusBadge from '../../../components/ui/StatusBadge';
import type { INewsletter, IUser } from '../../../types/api.types';

/**
 * NewsletterList Component
 * 
 * Displays a paginated table of all newsletter subscribers with search, filtering, and CRUD actions.
 * Features:
 * - Search by email with debounce
 * - Filter by status (SUBSCRIBED, UNSUBSCRIBED, BOUNCED)
 * - Pagination controls
 * - View, Edit Status, Delete actions per subscriber
 * - Loading skeleton, error, and empty states
 */
const NewsletterList = () => {

  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<{
    id: string;
    email: string;
  } | null>(null);

  // TanStack Query hooks
  const deleteSubscriber = useDeleteSubscriber();

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

    return apiParams;
  }, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);

  // Fetch subscribers with current params
  const { data, isLoading, isError, error } = useGetAllSubscribers(params);

  // Extract subscribers and pagination from API response
  const subscribers = (data as any)?.subscribers || [];
  const paginationData = (data as any)?.pagination || {};
  
  // Map backend pagination structure to component expectations
  const pagination = {
    page: paginationData.currentPage || 1,
    limit: itemsPerPage,
    total: paginationData.totalSubscribers || 0,
    totalPages: paginationData.totalPages || 1,
  };

  /**
   * Open delete confirmation modal
   * Sets the subscriber to delete and opens the modal
   */
  const handleDeleteClick = useCallback((subscriberId: string, email: string) => {
    setSubscriberToDelete({ id: subscriberId, email });
    setDeleteModalOpen(true);
  }, []);

  /**
   * Close delete confirmation modal
   * Clears the subscriber to delete and closes the modal
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setSubscriberToDelete(null);
  }, []);

  /**
   * Confirm and execute subscriber deletion
   * Calls the delete mutation and closes modal on success
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!subscriberToDelete) return;

    try {
      await deleteSubscriber.mutateAsync(subscriberToDelete.id);
      // Close modal on success
      setDeleteModalOpen(false);
      setSubscriberToDelete(null);
      // Cache invalidation handled by mutation onSuccess
    } catch (deleteError) {
      // Error handling is done in mutation's onError callback
      console.error('Delete subscriber error:', deleteError);
      // Keep modal open on error so user can retry
    }
  }, [subscriberToDelete, deleteSubscriber]);

  /**
   * Handle filter changes
   * Resets to page 1 when filters change
   */
  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value);
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
    (error as any)?.response?.data?.message || 'Failed to load subscribers.';

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  /**
   * Get user name from subscriber
   */
  const getUserName = (subscriber: INewsletter) => {
    if (!subscriber.userId) return '—';
    if (typeof subscriber.userId === 'string') return '—';
    const user = subscriber.userId as IUser;
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <div className="space-y-6">

      {/* Page header with title and Send Newsletter button */}
      <header className="">

        {/* title and description */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Newsletters</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage newsletter subscribers and send newsletters
          </p>
        </div>

        {/* search Bar and Send Newsletter button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">

          {/* Search input */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subscribers..."
                className="input-search"
              />
            </div>
          </div>

          {/* Send Newsletter button */}
          <Link to="/newsletters/send" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span className="">Send Newsletter</span>
            <MdSend size={24}/>
          </Link>

        </div>

        {/* subscriber count & filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* subscriber count */}
          <div className="">
             <p className="text-sm text-gray-500">Showing {pagination.total} subscribers</p>
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
                <option value="SUBSCRIBED">Subscribed</option>
                <option value="UNSUBSCRIBED">Unsubscribed</option>
                <option value="BOUNCED">Bounced</option>
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
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>

          </div>

        </div>

      </header>

      {/* Subscribers table */}
      <div className="table-container">
        <table className="table">
          {/* Table header */}
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">
                Email
              </th>
              <th className="table-header-cell">
                Status
              </th>
              <th className="table-header-cell">
                Subscribed At
              </th>
              <th className="table-header-cell">
                Source
              </th>
              <th className="table-header-cell">
                User
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
                      <div className="h-4 w-48 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-6 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
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
                <td colSpan={6} className="table-cell-center">
                  <div className="alert-error mx-auto max-w-md">{errorMessage}</div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && subscribers.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center">
                  <p className="text-gray-500">No subscribers found.</p>
                  {debouncedSearch || filterStatus !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search or filters.
                    </p>
                  ) : null}
                </td>
              </tr>
            )}

            {/* Subscriber rows */}
            {!isLoading &&
              !isError &&
              subscribers.map((subscriber: INewsletter) => {
                return (
                  <tr
                    key={subscriber._id}
                    className="table-row"
                  >
                    {/* Email */}
                    <td className="table-cell">
                      <div className="font-medium text-gray-900 whitespace-nowrap">
                        {subscriber.email}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="table-cell">
                      <StatusBadge 
                        status={subscriber.status} 
                        type="contact-status"
                      />
                    </td>

                    {/* Subscribed At */}
                    <td className="table-cell-text">
                      {formatDate(subscriber.subscribedAt)}
                    </td>

                    {/* Source */}
                    <td className="table-cell-text">
                      <span className="badge badge-soft">{subscriber.source}</span>
                    </td>

                    {/* User */}
                    <td className="table-cell-text">
                      {getUserName(subscriber)}
                    </td>

                    {/* Actions */}
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/newsletters/${subscriber._id}`}
                          className="flex items-center justify-center rounded-lg bg-white p-2 text-blue-600 transition hover:bg-blue-50"
                          title="View subscriber"
                        >
                          <FiEye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/newsletters/${subscriber._id}/edit`}
                          className="flex items-center justify-center rounded-lg bg-white p-2 text-teal-600 transition hover:bg-teal-50"
                          title="Edit status"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(subscriber._id, subscriber.email)
                          }
                          className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          title="Delete subscriber"
                          disabled={deleteSubscriber.isPending}
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
        title="Delete Subscriber"
        message={
          subscriberToDelete
            ? `Are you sure you want to delete the subscriber "${subscriberToDelete.email}"? This action cannot be undone.`
            : 'Are you sure you want to delete this subscriber? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteSubscriber.isPending}
      />
    </div>
  );
};

export default NewsletterList;
