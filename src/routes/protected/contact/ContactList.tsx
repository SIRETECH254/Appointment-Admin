import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiList, FiEye, FiSend, FiAlertTriangle } from 'react-icons/fi';
import {
  useGetAllContactMessages,
} from '../../../tanstack/useContact';
import Pagination from '../../../components/ui/Pagination';
import StatusBadge from '../../../components/ui/StatusBadge';
import {
  formatDateTime,
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
  const contacts = data?.contacts ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalContacts: 0,
    hasNextPage: false,
    hasPrevPage: false,
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
  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  return (
    <div className="space-y-6">
      {/* Page header with title */}
      <header className="">
        {/* title and description */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view all contact messages
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
                placeholder="Search contacts..."
                className="input-search"
              />
            </div>
          </div>
        </div>

        {/* contact count & filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* contact count */}
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.totalContacts} contacts</p>
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
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
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
          <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
            <FiAlertTriangle className="text-brand-accent mb-4" size={48} />
            <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
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
                      <StatusBadge status={contact.status} type="contact-status" />
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
                      className="flex items-center justify-center rounded-lg bg-white p-2 text-blue-600 transition hover:bg-blue-50"
                      title="View contact"
                    >
                      <FiEye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/contact/${contact._id}/reply`}
                      className="flex items-center justify-center rounded-lg bg-white p-2 text-teal-600 transition hover:bg-teal-50"
                      title="Reply to contact"
                    >
                      <FiSend className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalContacts}
            currentPageCount={contacts.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default ContactList;
