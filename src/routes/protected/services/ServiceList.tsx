import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVisibility, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useGetAllServices, useDeleteService } from '../../../tanstack/useServices';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { formatDateTime, formatPrice, formatDuration } from '../../../utils/serviceUtils';
import type { IService } from '../../../types/api.types';

/**
 * ServiceList Component
 * 
 * Displays a paginated table of all services with search, filtering, and CRUD actions.
 * Features:
 * - Search by name/description with debounce
 * - Filter by status (active/inactive)
 * - Pagination controls
 * - View, Edit, Delete actions per service
 * - Loading skeleton, error, and empty states
 */
const ServiceList = () => {

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
  const [serviceToDelete, setServiceToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // TanStack Query hooks
  const deleteService = useDeleteService();

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
      apiParams.status = filterStatus === 'active' ? 'active' : 'inactive';
    }

    return apiParams;
  }, [debouncedSearch, filterStatus, currentPage, itemsPerPage]);

  // Fetch services with current params
  const { data, isLoading, isError, error } = useGetAllServices(params);

  // Extract services and pagination from API response
  const services = (data as any)?.services || [];
  const pagination = (data as any)?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  /**
   * Open delete confirmation modal
   * Sets the service to delete and opens the modal
   */
  const handleDeleteClick = useCallback((serviceId: string, serviceName: string) => {
    setServiceToDelete({ id: serviceId, name: serviceName });
    setDeleteModalOpen(true);
  }, []);

  /**
   * Close delete confirmation modal
   * Clears the service to delete and closes the modal
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setServiceToDelete(null);
  }, []);

  /**
   * Confirm and execute service deletion
   * Calls the delete mutation and closes modal on success
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!serviceToDelete) return;

    try {
      await deleteService.mutateAsync(serviceToDelete.id);
      // Close modal on success
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      // Cache invalidation handled by mutation onSuccess
    } catch (deleteError) {
      // Error handling is done in mutation's onError callback
      console.error('Delete service error:', deleteError);
      // Keep modal open on error so user can retry
    }
  }, [serviceToDelete, deleteService]);

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
    (error as any)?.response?.data?.message || 'Failed to load services.';

  return (
    <div className="space-y-6">
      {/* Page header with title and Add Service button */}
      <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage available services
          </p>
        </div>
        <Link to="/services/new" className="btn-primary flex items-center gap-2">
           <span className="">Add Service</span>
           <MdAdd size={24}/>
        </Link>
      </div>

      {/* Filters and search toolbar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-y-2 items-start md:flex-row md:items-center md:justify-between">
          {/* Search input */}
          <div className="relative ">
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
              placeholder="Search services..."
              className="input-search"
            />
          </div>
           
           {/* filters */}
          <div className="flex flex-row gap-2 flex-wrap items-center"> 

            {/* Status filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="input-select w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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

      {/* Services table */}
      <div className="table-container">
        <table className="table">
          {/* Table header */}
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">
                Name
              </th>
              <th className="table-header-cell">
                Duration
              </th>
              <th className="table-header-cell">
                Price
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
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-300" />
                    </td>
                    <td className="table-cell">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
                    </td>
                    <td className="table-cell" />
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
            {!isLoading && !isError && services.length === 0 && (
              <tr>
                <td colSpan={6} className="table-cell-center">
                  <p className="text-gray-500">No services found.</p>
                  {debouncedSearch || filterStatus !== 'all' ? (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search or filters.
                    </p>
                  ) : null}
                </td>
              </tr>
            )}

            {/* Service rows */}
            {!isLoading &&
              !isError &&
              services.map((service: IService) => (
                <tr
                  key={service._id}
                  className="table-row"
                >
                  {/* Name */}
                  <td className="table-cell">
                    <div className="font-medium text-gray-900">
                      {service.name}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="table-cell-text">
                    {formatDuration(service.duration)}
                  </td>

                  {/* Price */}
                  <td className="table-cell-text">
                    {formatPrice(service.fullPrice)}
                  </td>

                  {/* Status */}
                  <td className="table-cell">
                    <span
                      className={
                        service.isActive
                          ? 'badge badge-success'
                          : 'badge badge-error'
                      }
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Created date */}
                  <td className="table-cell-text">
                    {formatDateTime(service.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/services/${service._id}`}
                        className="btn-ghost btn-sm flex items-center gap-1"
                        title="View service"
                      >
                        <MdVisibility className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/services/${service._id}/edit`}
                        className="btn-secondary btn-sm flex items-center gap-1"
                        title="Edit service"
                      >
                        <MdEdit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteClick(service._id, service.name)
                        }
                        className="btn-ghost btn-sm flex items-center gap-1 text-red-600 hover:text-red-700"
                        title="Delete service"
                        disabled={deleteService.isPending}
                      >
                        <MdDelete className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoading && !isError && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        message={
          serviceToDelete
            ? `Are you sure you want to delete service "${serviceToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this service? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-primary bg-red-600 hover:bg-red-700"
        isLoading={deleteService.isPending}
      />
    </div>
  );
};

export default ServiceList;
