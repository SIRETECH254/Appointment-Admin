# Edit Service Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetServiceById, useUpdateService } from '@/tanstack/useServices';
import type { IService } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/services/:id/edit`).
- **TanStack Query:** `useGetServiceById(id)` fetches service data for form pre-population.
- **Update Mutation:** `useUpdateService()` handles service update with cache invalidation.
- **Local State:**
  - `name` - Service name (required)
  - `description` - Service description (optional)
  - `duration` - Service duration in minutes (required)
  - `fullPrice` - Service full price (required)
  - `sortOrder` - Service sort order (optional, default: 0)
  - `isActive` - Service active status (boolean)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state

## UI Structure
- **Header Card:** Title "Edit Service" with description.
- **Form Card:** Two-column grid layout with form fields.
- **Form Fields:** name, description, duration, fullPrice, sortOrder, isActive toggle.
- **Actions:** Cancel button (navigate back), Save button (submit form).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Edit Service                               │
│ Update service information and settings.   │
├────────────────────────────────────────────┤
│ Name                                       │
│ Description                               │
│ Duration    │ Full Price                   │
│ Sort Order  │ Active Status (toggle)      │
├────────────────────────────────────────────┤
│ [Cancel]  [Save Changes]                   │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Edit Service                                      │
│ Update service information and settings.           │
│                                                    │
│ Name: [Haircut                    ]              │
│ Description: [Classic men haircut...]             │
│ Duration: [30] (minutes)                          │
│ Full Price: [500] (KES)                          │
│ Sort Order: [1]                                  │
│ ☑ Active                                          │
│                                                    │
│ [Cancel]                    [Save Changes]        │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Name:** Text input (required), `input` class.
- **Description:** Textarea (optional), `input` class.
- **Duration:** Number input (required, min: 1), `input` class.
- **Full Price:** Number input (required, min: 0), `input` class.
- **Sort Order:** Number input (optional, min: 0, default: 0), `input` class.
- **Active Status:** Checkbox or toggle switch for `isActive` boolean.

## API Integration
- **Get Endpoint:** `GET /api/services/:serviceId` via `useGetServiceById(serviceId)`.
- **Update Endpoint:** `PUT /api/services/:serviceId` via `useUpdateService()` mutation.
- **Request Payload:**
  ```typescript
  {
    name?: string,
    description?: string,
    duration?: number,
    fullPrice?: number,
    sortOrder?: number,
    isActive?: boolean
  }
  ```
- **Response:** Updated service object.
- **Cache Invalidation:** Mutation invalidates `['services']` and `['service', serviceId]` queries.

## Components Used
- React Router DOM: `Link`, `useNavigate`, `useParams` for routing.
- TanStack Query: `useGetServiceById`, `useUpdateService` hooks.
- Tailwind CSS classes: `label`, `input`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching service data.
- **Error State:** Display `alert-error` with API error message if fetch or update fails.
- **Validation:** Client-side validation for required fields (name, duration, fullPrice) and positive numbers.
- **Submit Error:** Show inline error message if update fails, keep form data.
- **Success State:** Show `alert-success` message, then navigate after 1.2 seconds.

## Navigation Flow
- Route: `/services/:id/edit`.
- **Cancel Button:** Navigate back to `/services` (service list).
- **Success:** After successful update, navigate to `/services` (service list).
- **Error:** Stay on edit page, show error message.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits update.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || duration === undefined || fullPrice === undefined) {
      setInlineMessage({ type: 'error', text: 'Name, duration and full price are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await updateService.mutateAsync({
        serviceId: id,
        serviceData: { name, description, duration, fullPrice, sortOrder, isActive }
      });
      setInlineMessage({ type: 'success', text: 'Service updated successfully.' });
      setTimeout(() => navigate('/services'), 1200);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to update service.';
      setInlineMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  ```

- **`hydrateForm`** — Pre-populates form fields from fetched service data.
  ```tsx
  useEffect(() => {
    if (!service) return;
    setName(service.name ?? '');
    setDescription(service.description ?? '');
    setDuration(service.duration ?? 0);
    setFullPrice(service.fullPrice ?? 0);
    setSortOrder(service.sortOrder ?? 0);
    setIsActive(service.isActive ?? true);
  }, [service]);
  ```

- **`canSubmit`** — Computes whether form can be submitted.
  ```tsx
  const canSubmit = useMemo(() => {
    return Boolean(
      name.trim() && 
      duration !== undefined && 
      duration > 0 && 
      fullPrice !== undefined && 
      fullPrice >= 0
    ) && !isSubmitting;
  }, [name, duration, fullPrice, isSubmitting]);
  ```

## Future Enhancements
- Service image upload functionality.
- Service category assignment.
- Multiple pricing tiers (regular, premium, etc.).
- Service duration presets (15min, 30min, 1h, etc.).
- Service availability scheduling.
- Service dependencies (prerequisites, add-ons).

