# Create Break Screen Documentation

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
import { useCreateBreak } from '../../../tanstack/useBreaks';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import { isTimeBefore } from '../../../utils/breakUtils';
import type { CreateBreakPayload, IUser } from '../../../types/api.types';
```

## Context and State Management
- **Create Mutation:** `useCreateBreak()` handles break creation with cache invalidation.
- **Staff Users Query:** `useGetAllUsers({ role: 'staff' })` fetches staff members for dropdown.
- **Local State:**
  - `staffId` - Selected staff member ID (required)
  - `startTime` - Break start time in datetime-local format (required)
  - `endTime` - Break end time in datetime-local format (required)
  - `reason` - Break reason (optional, max 300 characters)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state

## UI Structure
- **Header Card:** Title "Create Break" with description.
- **Form Card:** Two-column grid layout with form fields.
- **Form Fields:** staffId select, startTime datetime-local, endTime datetime-local, reason textarea.
- **Actions:** Cancel button (navigate back), Create button (submit form).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Create Break                               │
│ Add a new break schedule for staff.       │
├────────────────────────────────────────────┤
│ Staff         │ Start Time                │
│ End Time      │ Reason                    │
├────────────────────────────────────────────┤
│ [Cancel]  [Create Break]                  │
└────────────────────────────────────────────┘
```

## Form Inputs
- **Staff:** Select dropdown with staff members (required), `input-select` class.
- **Start Time:** Datetime-local input (required), `input` class.
- **End Time:** Datetime-local input (required), `input` class.
- **Reason:** Textarea input (optional, max 300 characters), `input` class.

## API Integration
- **Endpoint:** `POST /api/breaks` via `useCreateBreak()` mutation.
- **Request Payload:**
  ```typescript
  {
    staffId: string,
    startTime: string,  // ISO date string
    endTime: string,    // ISO date string
    reason?: string
  }
  ```
- **Response:** Created break object with `_id`.
- **Cache Invalidation:** Mutation invalidates `['breaks']` query to refresh list.

## Components Used
- React Router DOM: `Link`, `useNavigate` for routing.
- TanStack Query: `useCreateBreak`, `useGetAllUsers` hooks.
- Tailwind CSS classes: `label`, `input`, `input-select`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Validation:** Client-side validation for required fields and time validation.
- **Time Validation:** Start time must be before end time.
- **Reason Validation:** Maximum length check (300 characters).
- **Submit Error:** Show inline `alert-error` with API error message if creation fails.
- **Success State:** Show `alert-success` message, then navigate to break details page.

## Navigation Flow
- Route: `/breaks/new`.
- **Cancel Button:** Navigate back to `/breaks` (break list).
- **Success:** After successful creation, navigate to `/breaks/:id` (newly created break's details page).
- **Error:** Stay on create page, show error message, keep form data.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits break creation.
- **`canSubmit`** — Computes whether form can be submitted.

## Future Enhancements
- Recurring break functionality (daily, weekly patterns).
- Break conflict detection (warn if break overlaps with existing breaks or appointments).
- Quick time presets (30 min, 1 hour, 2 hours).
- Calendar picker for better date selection.
- Bulk break creation for multiple staff members.
