import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateService } from '../../../tanstack/useServices';
import type { CreateServicePayload, IService } from '../../../types/api.types';

/**
 * Inline message type for form feedback
 */
type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

/**
 * ServiceAdd Component
 * 
 * Allows admin to create a new service.
 * All required fields must be filled, and service name must be unique.
 * 
 * Features:
 * - Form validation (required fields, positive numbers)
 * - Creates service via API
 * - Shows success/error feedback
 * - Navigates to service details on success
 */
const ServiceAdd = () => {
  const navigate = useNavigate();

  // TanStack Query hook
  const createService = useCreateService();

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
      fullPrice >= 0 &&
      !isSubmitting
    );
  }, [name, duration, fullPrice, isSubmitting]);

  /**
   * Handle form submission
   * Validates all fields, builds payload, and calls create mutation
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Trim all input values
      const trimmedName = name.trim();
      const trimmedDescription = description.trim();

      // Client-side validation
      if (!trimmedName || duration === undefined || fullPrice === undefined) {
        setInlineMessage({
          type: 'error',
          text: 'Name, duration and full price are required.',
        });
        return;
      }

      // Validate duration
      if (duration <= 0) {
        setInlineMessage({
          type: 'error',
          text: 'Duration must be greater than 0.',
        });
        return;
      }

      // Validate price
      if (fullPrice < 0) {
        setInlineMessage({
          type: 'error',
          text: 'Full price cannot be negative.',
        });
        return;
      }

      // Validate sort order if provided
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
        // Build create payload
        const serviceData: CreateServicePayload = {
          name: trimmedName,
          duration,
          fullPrice,
        };

        // Add optional fields if provided
        if (trimmedDescription) {
          serviceData.description = trimmedDescription;
        }

        // Add optional sort order
        if (sortOrder !== undefined && sortOrder > 0) {
          serviceData.sortOrder = sortOrder;
        }

        // Add active status
        serviceData.isActive = isActive;

        // Call create mutation
        const result = await createService.mutateAsync(serviceData);

        // Extract service ID from response (handle different response shapes)
        const createdService = (result as any)?.service ?? (result as unknown as IService);
        const serviceId = createdService?._id || (result as any)?._id;

        // Show success message
        setInlineMessage({
          type: 'success',
          text: 'Service created successfully.',
        });

        // Navigate to service details page after delay
        if (serviceId) {
          redirectTimer.current = window.setTimeout(() => {
            navigate(`/services/${serviceId}`, { replace: true });
          }, 1200);
        } else {
          // Fallback: navigate to service list if no ID
          redirectTimer.current = window.setTimeout(() => {
            navigate('/services', { replace: true });
          }, 1200);
        }
      } catch (submitError: any) {
        // Extract error message from API response
        const errorMessage =
          submitError?.response?.data?.message || 'Failed to create service.';
        setInlineMessage({ type: 'error', text: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, description, duration, fullPrice, sortOrder, isActive, createService, navigate]
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create Service</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new service to the system
        </p>
      </div>

      {/* Create service form */}
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
            disabled={!canSubmit || createService.isPending}
            className="btn-primary"
          >
            {isSubmitting || createService.isPending
              ? 'Creating...'
              : 'Create Service'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceAdd;
