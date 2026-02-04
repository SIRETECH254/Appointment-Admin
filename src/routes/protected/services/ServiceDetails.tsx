import { Link, useParams } from 'react-router-dom';
import { useGetServiceById } from '../../../tanstack/useServices';
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

  // Extract service from API response (handle different response shapes)
  const service = (data as any)?.service ?? (data as IService);

  // Get error message from API response
  const errorMessage =
    (error as any)?.response?.data?.message || 'Failed to load service.';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">
        Loading service...
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="alert-error">{errorMessage}</div>
        <Link to="/services" className="btn-secondary">
          Back to Services
        </Link>
      </div>
    );
  }

  // No service found
  if (!service) {
    return (
      <div className="space-y-4">
        <div className="alert-error">Service not found.</div>
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
                <span
                  className={
                    service.isActive
                      ? 'badge badge-success'
                      : 'badge badge-error'
                  }
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
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

      {/* Service details card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Section title */}
        <h2 className="text-lg font-semibold text-gray-900">
          Service Details
        </h2>
        {/* Two-column grid on desktop for compact layout */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Name */}
          <div className="md:col-span-2">
            <p className="text-xs uppercase text-gray-400">Name</p>
            <p className="text-sm text-gray-700">{service.name || '—'}</p>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <p className="text-xs uppercase text-gray-400">Description</p>
            <p className="text-sm text-gray-700">{service.description || '—'}</p>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs uppercase text-gray-400">Duration</p>
            <p className="text-sm text-gray-700">{formatDuration(service.duration)}</p>
          </div>

          {/* Full Price */}
          <div>
            <p className="text-xs uppercase text-gray-400">Full Price</p>
            <p className="text-sm text-gray-700">{formatPrice(service.fullPrice)}</p>
          </div>

          {/* Sort Order */}
          <div>
            <p className="text-xs uppercase text-gray-400">Sort Order</p>
            <p className="text-sm text-gray-700">{service.sortOrder ?? 0}</p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs uppercase text-gray-400">Status</p>
            <p className="text-sm text-gray-700">
              {service.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>

          {/* Created Date */}
          <div>
            <p className="text-xs uppercase text-gray-400">Created</p>
            <p className="text-sm text-gray-700">
              {formatDateTimeWithTime(service.createdAt)}
            </p>
          </div>

          {/* Updated Date */}
          <div>
            <p className="text-xs uppercase text-gray-400">Last Updated</p>
            <p className="text-sm text-gray-700">
              {formatDateTimeWithTime(service.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
