import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetServiceById, useUpdateService } from '../../../tanstack/useServices';
import type { IService } from '../../../types/api.types';

/**
 * Inline message type for form feedback
 */
type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

/**
 * ServiceEdit Component
 * 
 * Allows admin to edit service information including name, description, duration, price, sort order, and active status.
 * 
 * Features:
 * - Pre-populates form from fetched service data
 * - Validates required fields and numeric values
 * - Updates service via API
 * - Shows success/error feedback
 * - Navigates on success
 */
const ServiceEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TanStack Query hooks
  const { data, isLoading, isError, error } = useGetServiceById(id || '');
  const updateService = useUpdateService();

  // Extract service from API response (handle different response shapes)
  const service = (data as any)?.service ?? (data as IService);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [fullPrice, setFullPrice] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // UI state
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect timer ref for cleanup
  const redirectTimer = useRef<number | null>(null);

  /**
   * Hydrate form fields from fetched service data
   * Runs when service data is loaded or changes
   */
  useEffect(() => {
    if (!service) return;

    setName(service.name ?? '');
    setDescription(service.description ?? '');
    setDuration(service.duration ?? 0);
    setFullPrice(service.fullPrice ?? 0);
    setSortOrder(service.sortOrder ?? 0);
    setIsActive(service.isActive ?? true);
  }, [service]);

  /**
   * Cleanup redirect timer on unmount
   */
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        window.clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  /**
   * Determine if form can be submitted
   * Requires name, duration > 0, and fullPrice >= 0, and not currently submitting
   */
  const canSubmit = useMemo(() => {
    return Boolean(
      name.trim() && 
      duration !== undefined && 
      duration > 0 && 
      fullPrice !== undefined && 
      fullPrice >= 0
    ) && !isSubmitting;
  }, [name, duration, fullPrice, isSubmitting]);

  /**
   * Handle form submission
   * Validates fields, builds payload, and calls update mutation
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Client-side validation
      const trimmedName = name.trim();
      const trimmedDescription = description.trim();

      if (!trimmedName || duration === undefined || fullPrice === undefined) {
        setInlineMessage({
          type: 'error',
          text: 'Name, duration and full price are required.',
        });
        return;
      }

      if (duration <= 0) {
        setInlineMessage({
          type: 'error',
          text: 'Duration must be greater than 0.',
        });
        return;
      }

      if (fullPrice < 0) {
        setInlineMessage({
          type: 'error',
          text: 'Full price cannot be negative.',
        });
        return;
      }

      if (sortOrder !== undefined && sortOrder < 0) {
        setInlineMessage({
          type: 'error',
          text: 'Sort order cannot be negative.',
        });
        return;
      }

      setInlineMessage(null);
      setIsSubmitting(true);

      try {
        // Build update payload
        const serviceData: any = {
          name: trimmedName,
        };

        // Add optional fields if provided
        if (trimmedDescription) {
          serviceData.description = trimmedDescription;
        } else {
          serviceData.description = null;
        }

        // Add required numeric fields
        serviceData.duration = duration;
        serviceData.fullPrice = fullPrice;

        // Add optional sort order
        if (sortOrder !== undefined) {
          serviceData.sortOrder = sortOrder;
        }

        // Add active status
        serviceData.isActive = isActive;

        // Call update mutation
        await updateService.mutateAsync({
          serviceId: id!,
          serviceData,
        });

        // Show success message
        setInlineMessage({
          type: 'success',
          text: 'Service updated successfully.',
        });

        // Navigate back to service list after delay
        redirectTimer.current = window.setTimeout(() => {
          navigate('/services', { replace: true });
        }, 1200);
      } catch (submitError: any) {
        // Extract error message from API response
        const errorMessage =
          submitError?.response?.data?.message || 'Failed to update service.';
        setInlineMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, description, duration, fullPrice, sortOrder, isActive, id, updateService, navigate]
  );

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
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Service</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update service information and settings
        </p>
      </div>

      {/* Edit service form */}
      <form
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        {/* Form fields grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Name */}
          <div className="auth-field md:col-span-2">
            <label className="label">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Service name"
              className="input"
              required
            />
          </div>

          {/* Description */}
          <div className="auth-field md:col-span-2">
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Service description"
              className="input"
              rows={3}
            />
          </div>

          {/* Duration */}
          <div className="auth-field">
            <label className="label">
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="30"
              className="input"
              min={1}
              required
            />
          </div>

          {/* Full Price */}
          <div className="auth-field">
            <label className="label">
              Full Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={fullPrice}
              onChange={(e) => setFullPrice(Number(e.target.value))}
              placeholder="500"
              className="input"
              min={0}
              step="0.01"
              required
            />
          </div>

          {/* Sort Order */}
          <div className="auth-field">
            <label className="label">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              placeholder="0"
              className="input"
              min={0}
            />
            <p className="mt-1 text-xs text-gray-500">
              Lower numbers appear first
            </p>
          </div>

          {/* Active status */}
          <div className="auth-field">
            <label className="label">Status</label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active service
              </label>
            </div>
          </div>
        </div>

        {/* Inline success/error message */}
        {inlineMessage ? (
          <div
            className={
              inlineMessage.type === 'success'
                ? 'alert-success mt-4'
                : 'alert-error mt-4'
            }
          >
            {inlineMessage.text}
          </div>
        ) : null}

        {/* Form actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link to="/services" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!canSubmit || updateService.isPending}
            className="btn-primary"
          >
            {isSubmitting || updateService.isPending
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceEdit;
