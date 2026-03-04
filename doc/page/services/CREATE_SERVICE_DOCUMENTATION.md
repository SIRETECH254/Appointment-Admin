# Create Service Screen Documentation

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
import { Link, useNavigate } from 'react-router-dom';
import { useCreateService } from '../../../tanstack/useServices';
import type { CreateServicePayload, IService } from '../../../types/api.types';
```

## Context and State Management
- **Create Mutation:** `useCreateService()` handles service creation with cache invalidation.
- **Local State:**
  - `name` - Service name (required)
  - `description` - Service description (optional)
  - `duration` - Service duration in minutes (required)
  - `fullPrice` - Service full price (required)
  - `sortOrder` - Service sort order (optional, default: 0)
  - `isActive` - Service active status (boolean, default: true)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state

## UI Structure
- **Header Card:** Title "Create Service" with description.
- **Form Card:** Two-column grid layout with form fields.
- **Form Fields:** name, description, duration, fullPrice, sortOrder, isActive toggle.
- **Actions:** Cancel button (navigate back), Create button (submit form).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Create Service                              │
│ Add a new service to the system.            │
├────────────────────────────────────────────┤
│ Name                                       │
│ Description                               │
│ Duration    │ Full Price                   │
│ Sort Order  │ Active Status (toggle)      │
├────────────────────────────────────────────┤
│ [Cancel]  [Create Service]                │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Create Service                                     │
│ Add a new service to the system.                   │
│                                                    │
│ Name: [Haircut                    ]               │
│ Description: [Classic men haircut...]             │
│ Duration: [30] (minutes)                          │
│ Full Price: [500] (KES)                           │
│ Sort Order: [1]                                   │
│ ☑ Active                                          │
│                                                    │
│ [Cancel]                    [Create Service]      │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Name:** Text input (required), `input` class.
- **Description:** Textarea (optional), `input` class.
- **Duration:** Number input (required, min: 1), `input` class.
- **Full Price:** Number input (required, min: 0), `input` class.
- **Sort Order:** Number input (optional, min: 0, default: 0), `input` class.
- **Active Status:** Checkbox or toggle switch for `isActive` boolean (default: true).

## API Integration
- **Endpoint:** `POST /api/services` via `useCreateService()` mutation.
- **Request Payload:**
  ```typescript
  {
    name: string,
    description?: string,
    duration: number,
    fullPrice: number,
    sortOrder?: number,
    isActive?: boolean
  }
  ```
- **Response:** Created service object with `_id`.
- **Cache Invalidation:** Mutation invalidates `['services']` query to refresh list.

## Components Used
- React Router DOM: `Link`, `useNavigate` for routing.
- TanStack Query: `useCreateService` hook.
- Tailwind CSS classes: `label`, `input`, `input-select`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Validation:** Client-side validation for required fields (name, duration, fullPrice) and positive numbers.
- **Duration Validation:** Must be greater than 0.
- **Price Validation:** Must be zero or positive.
- **Name Uniqueness:** Server-side validation, display error if service name already exists.
- **Submit Error:** Show inline `alert-error` with API error message if creation fails.
- **Success State:** Show `alert-success` message, then navigate to service details page.

## Navigation Flow
- Route: `/services/new`.
- **Cancel Button:** Navigate back to `/services` (service list).
- **Success:** After successful creation, navigate to `/services/:id` (newly created service's details page).
- **Error:** Stay on create page, show error message, keep form data.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits service creation.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || duration === undefined || fullPrice === undefined) {
      setInlineMessage({ type: 'error', text: 'Name, duration and full price are required.' });
      return;
    }
    if (duration <= 0) {
      setInlineMessage({ type: 'error', text: 'Duration must be greater than 0.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createService.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        duration,
        fullPrice,
        sortOrder: sortOrder || 0,
        isActive: isActive ?? true
      });
      setInlineMessage({ type: 'success', text: 'Service created successfully.' });
      setTimeout(() => navigate(`/services/${result._id}`), 1200);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to create service.';
      setInlineMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  ```

- **`canSubmit`** — Computes whether form can be submitted.
  ```tsx
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
  ```

## Future Enhancements
- Service image upload functionality.
- Service category assignment.
- Multiple pricing tiers (regular, premium, etc.).
- Service duration presets (15min, 30min, 1h, etc.).
- Service availability scheduling.
- Service dependencies (prerequisites, add-ons).
- Bulk service import (CSV upload).
