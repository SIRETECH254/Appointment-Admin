import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { FiSearch, FiFilter, FiList, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useGetAllServices, useDeleteService } from '../../../tanstack/useServices';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StatusBadge from '../../../components/ui/StatusBadge';
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
      <header className="">
        {/* title and description */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage available services
          </p>
        </div>

        {/* search Bar and Add button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search input */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search services..."
                className="input-search"
              />
            </div>
          </div>

          {/* Add service button */}
          <Link to="/services/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto">
            <span className="">Add Service</span>
            <MdAdd size={24}/>
          </Link>
        </div>

        {/* service count & filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* service count */}
          <div className="">
            <p className="text-sm text-gray-500">Showing {pagination.total} services</p>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
                    <div className="font-medium text-gray-900 whitespace-nowrap">
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
                    <StatusBadge status={service.isActive} type="service-status" />
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
                        className="flex items-center justify-center rounded-lg bg-white p-2 text-blue-600 transition hover:bg-blue-50"
                        title="View service"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/services/${service._id}/edit`}
                        className="flex items-center justify-center rounded-lg bg-white p-2 text-teal-600 transition hover:bg-teal-50"
                        title="Edit service"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteClick(service._id, service.name)
                        }
                        className="flex items-center justify-center rounded-lg bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        title="Delete service"
                        disabled={deleteService.isPending}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
