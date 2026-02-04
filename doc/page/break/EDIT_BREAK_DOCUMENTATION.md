# Edit Break Screen Documentation

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
import { useGetBreakById, useUpdateBreak } from '@/tanstack/useBreaks';
import { useGetAllUsers } from '@/tanstack/useUsers';
import { formatDateTimeLocal } from '@/utils/breakUtils';
import type { IBreak, UpdateBreakPayload } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/breaks/:id/edit`).
- **TanStack Query:** `useGetBreakById(id)` fetches break data for form pre-population.
- **Staff Users Query:** `useGetAllUsers({ role: 'staff' })` fetches staff members for dropdown.
- **Update Mutation:** `useUpdateBreak()` handles break update with cache invalidation.
- **Local State:**
  - `staffId` - Selected staff member ID (required)
  - `startTime` - Break start time in datetime-local format (required)
  - `endTime` - Break end time in datetime-local format (required)
  - `reason` - Break reason (optional)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state

## UI Structure
- **Header Card:** Title "Edit Break" with description.
- **Form Card:** Two-column grid layout with form fields.
- **Form Fields:** staffId select, startTime datetime-local, endTime datetime-local, reason textarea.
- **Actions:** Cancel button (navigate back), Save button (submit form).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Edit Break                                  │
│ Update break schedule information.          │
├────────────────────────────────────────────┤
│ Staff         │ Start Time                 │
│ End Time      │ Reason                     │
├────────────────────────────────────────────┤
│ [Cancel]  [Save Changes]                    │
└────────────────────────────────────────────┘
```

## Form Inputs
- **Staff:** Select dropdown with staff members (required), `input-select` class. Can change staff member.
- **Start Time:** Datetime-local input (required), `input` class.
- **End Time:** Datetime-local input (required), `input` class.
- **Reason:** Textarea input (optional, max 300 characters), `input` class.

## API Integration
- **Get Endpoint:** `GET /api/breaks/:breakId` via `useGetBreakById(breakId)`.
- **Update Endpoint:** `PUT /api/breaks/:breakId` via `useUpdateBreak()` mutation.
- **Request Payload:**
  ```typescript
  {
    staffId?: string,
    startTime?: string,  // ISO date string
    endTime?: string,    // ISO date string
    reason?: string
  }
  ```
- **Response:** Updated break object.
- **Cache Invalidation:** Mutation invalidates `['breaks']` and `['break', breakId]` queries.

## Components Used
- React Router DOM: `Link`, `useNavigate`, `useParams` for routing.
- TanStack Query: `useGetBreakById`, `useUpdateBreak`, `useGetAllUsers` hooks.
- Tailwind CSS classes: `label`, `input`, `input-select`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching break data.
- **Error State:** Display `alert-error` with API error message if fetch or update fails.
- **Validation:** Client-side validation for required fields and time validation.
- **Submit Error:** Show inline error message if update fails, keep form data.
- **Success State:** Show `alert-success` message, then navigate after 1.2 seconds.

## Navigation Flow
- Route: `/breaks/:id/edit`.
- **Cancel Button:** Navigate back to `/breaks` (break list).
- **Success:** After successful update, navigate to `/breaks` (break list).
- **Error:** Stay on edit page, show error message.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits update.
- **`hydrateForm`** — Pre-populates form fields from fetched break data.
- **`canSubmit`** — Computes whether form can be submitted.

## Implementation Details
- **Datetime-local Conversion:** Convert ISO date strings from API to datetime-local format for inputs, and back to ISO for API submission.
- **Staff Dropdown:** Pre-select current staff member, allow changing to different staff.
- **Time Validation:** Ensure start time is before end time before submission.
- **Reason Field:** Optional textarea with max length validation (300 characters).
- **Form Hydration:** Pre-populate all fields from fetched break data, handling both string and populated staffId.

## Future Enhancements
- Show break conflicts when editing (warn if new times overlap with existing breaks/appointments).
- Undo/redo functionality for break edits.
- Break history/audit log display.
- Quick time adjustments (add/subtract 15 min, 30 min, 1 hour).
- Duplicate break functionality (create new break with same times for different staff).
