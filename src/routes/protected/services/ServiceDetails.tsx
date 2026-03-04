import { Link, useParams } from 'react-router-dom';
import { FiTag, FiFileText, FiClock, FiDollarSign, FiList, FiCheckCircle, FiXCircle, FiCalendar, FiAlertTriangle, FiSettings } from 'react-icons/fi';
import { useGetServiceById } from '../../../tanstack/useServices';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatDateTimeWithTime, formatPrice, formatDuration } from '../../../utils/serviceUtils';
import type { IService } from '../../../types/api.types';

/**
 * ServiceDetails Component
 * 
 * Displays detailed information about a specific service.
 * Shows name, description, duration, price, sort order, status, and timestamps.
 * Provides Edit button for quick access to edit page.
 * 
 * Features:
 * - Service header with name and status badge
 * - Service details section with all information
 * - Edit action button
 * - Loading and error states
 */
const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch service data
  const { data, isLoading, isError, error } = useGetServiceById(id || '');

  // Extract service from API response
  const service = data?.service;

  // Get error message from API response
  const errorMessage = error?.response?.data?.message ?? 'An error occurred';

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="flex flex-col gap-6 items-center justify-center">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-300 rounded" />
              <div className="h-6 w-20 bg-gray-300 rounded-full" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-gray-300 rounded" />
              <div className="h-10 w-32 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
        {/* Service Information skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded" />
                <div className="h-4 w-48 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        </div>
        {/* Service Settings skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded" />
                <div className="h-4 w-32 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        </div>
        {/* Status Information skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-gray-300 rounded" />
            <div className="h-6 w-20 bg-gray-300 rounded-full" />
          </div>
        </div>
        {/* System Information skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 rounded" />
                <div className="h-4 w-48 bg-gray-300 rounded" />
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
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <FiAlertTriangle className="h-16 w-16 text-red-500" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Service</h2>
          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
        </div>
        <Link to="/services" className="btn-secondary">
          Back to Services
        </Link>
      </div>
    );
  }

  // No service found
  if (!service) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <FiXCircle className="h-16 w-16 text-gray-400" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Service Not Found</h2>
          <p className="mt-2 text-sm text-gray-500">The service you're looking for doesn't exist.</p>
        </div>
        <Link to="/services" className="btn-secondary">
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service header card: name, status, and primary actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Layout: stack on mobile, align items side-by-side on desktop */}
        <div className="flex flex-col gap-6 items-center justify-center">
          {/* Identity block: name + metadata */}
          <div className="flex items-center gap-4">
            <div>
              {/* Primary identity label */}
              <h1 className="text-xl font-semibold text-gray-900">
                {service.name ?? 'Service'}
              </h1>
              {/* Status pill */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <StatusBadge status={service.isActive} type="service-status" />
              </div>
            </div>
          </div>

          {/* CTA block: edit action */}
          <div className="flex flex-wrap gap-3">
            {/* Primary CTA: navigate to edit form */}
            <Link to={`/services/${service._id}/edit`} className="btn-primary">
              Edit Service
            </Link>
            {/* Secondary CTA: back to list */}
            <Link to="/services" className="btn-secondary">
              Back to Services
            </Link>
          </div>
        </div>
      </div>

      {/* Service Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiTag className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Service Information</h2>
        </div>
        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-start gap-3">
            <FiTag className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Name</p>
              <p className="text-sm text-gray-700">{service.name || '—'}</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <FiFileText className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700">{service.description || '—'}</p>
            </div>
          </div>
            </div>
          </div>

      {/* Service Settings Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiSettings className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Service Settings</h2>
        </div>
        <div className="space-y-4">
          {/* Duration */}
          <div className="flex items-start gap-3">
            <FiClock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Duration</p>
              <p className="text-sm text-gray-700">{formatDuration(service.duration)}</p>
            </div>
          </div>

          {/* Full Price */}
          <div className="flex items-start gap-3">
            <FiDollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Full Price</p>
              <p className="text-sm text-gray-700">{formatPrice(service.fullPrice)}</p>
            </div>
          </div>

          {/* Sort Order */}
          <div className="flex items-start gap-3">
            <FiList className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Sort Order</p>
              <p className="text-sm text-gray-700">{service.sortOrder ?? 0}</p>
            </div>
          </div>
            </div>
          </div>

      {/* Status Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiCheckCircle className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Status Information</h2>
        </div>
          <div className="flex items-start gap-3">
            {service.isActive ? (
              <FiCheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
            <FiXCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Status</p>
              <StatusBadge status={service.isActive} type="service-status" />
          </div>
            </div>
          </div>

      {/* System Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
        </div>
        <div className="space-y-4">
          {/* Created Date */}
          <div className="flex items-start gap-3">
            <FiCalendar className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Created</p>
              <p className="text-sm text-gray-700">
                {formatDateTimeWithTime(service.createdAt)}
              </p>
            </div>
          </div>

          {/* Updated Date */}
          <div className="flex items-start gap-3">
            <FiCalendar className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase text-gray-400 mb-1">Last Updated</p>
              <p className="text-sm text-gray-700">
                {formatDateTimeWithTime(service.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
