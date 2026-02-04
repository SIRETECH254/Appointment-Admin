import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVisibility, MdReply } from 'react-icons/md';
import {
  useGetAllContactMessages,
} from '../../../tanstack/useContact';
import Pagination from '../../../components/ui/Pagination';
import {
  formatDateTime,
  getStatusBadgeClass,
  getStatusDisplayName,
} from '../../../utils/contactUtils';
import type { IContact } from '../../../types/api.types';

/**
 * ContactList Component
 *
 * Displays a paginated list of contact messages with card layout, search, filtering, and actions.
 * Features:
 * - Search by name/email/subject with debounce
 * - Filter by status (new/read/replied/archived)
 * - Pagination controls
 * - View details and reply actions
 * - Loading skeleton, error, and empty states
 * - Card-based layout (no table)
 */
const ContactList = () => {
  // Search state with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Fetch contacts with current params
  const { data, isLoading, isError, error } = useGetAllContactMessages(params);

  // Extract contacts and pagination from API response
  const contacts = (data as any)?.contacts || [];
  const pagination = (data as any)?.pagination || {
    page: 1,
    limit: itemsPerPage,
    total: 0,
    totalPages: 1,
  };

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
    (error as any)?.response?.data?.message || 'Failed to load contacts.';

  return (
    <div className="space-y-6">
      {/* Page header with title */}
      <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view all contact messages
          </p>
        </div>
      </div>

      {/* Filters and search toolbar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
          {/* Search input */}
          <div className="relative w-full md:w-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              className="input-search"
            />
          </div>

          {/* filters */}
          <div className="flex flex-row gap-2 flex-wrap items-center w-full md:w-auto">
            {/* Status filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="input-select w-full"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Items per page */}
            <div>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="input-select w-full"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contact cards */}
      <div className="space-y-4">
        {/* Loading state: skeleton cards */}
        {isLoading && (
          <>
            {[...Array(5)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-gray-300 rounded mb-2" />
                    <div className="h-4 w-64 bg-gray-300 rounded mb-4" />
                    <div className="h-4 w-48 bg-gray-300 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-gray-300 rounded-full" />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="alert-error">{errorMessage}</div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && contacts.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
            <p className="text-gray-500">No contacts found.</p>
            {debouncedSearch || filterStatus !== 'all' ? (
              <p className="mt-2 text-sm text-gray-400">
                Try adjusting your search or filters.
              </p>
            ) : null}
          </div>
        )}

        {/* Contact cards */}
        {!isLoading &&
          !isError &&
          contacts.map((contact: IContact) => {
            return (
              <div
                key={contact._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side: content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={getStatusBadgeClass(contact.status)}>
                        {getStatusDisplayName(contact.status)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {contact.subject}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      From: <span className="font-medium">{contact.name}</span>{' '}
                      &lt;{contact.email}&gt;
                    </p>
                    {contact.phone && (
                      <p className="text-sm text-gray-600 mb-3">
                        Phone: {contact.phone}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {contact.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(contact.createdAt)}
                    </p>
                  </div>

                  {/* Right side: actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/contact/${contact._id}`}
                      className="btn-ghost btn-sm flex items-center gap-1"
                      title="View contact"
                    >
                      <MdVisibility className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/contact/${contact._id}/reply`}
                      className="btn-ghost btn-sm flex items-center gap-1"
                      title="Reply to contact"
                    >
                      <MdReply className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page || currentPage}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.total || 0}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ContactList;
