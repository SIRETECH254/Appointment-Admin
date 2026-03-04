# Break Details Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetBreakById } from '../../../tanstack/useBreaks';
import { formatBreakDateTime, formatBreakTimeRange, formatFullDateTime, getStaffName, getStaffInitials } from '../../../utils/breakUtils';
import type { IBreak } from '../../../types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/breaks/:id`).
- **TanStack Query:** `useGetBreakById(id)` fetches break data for display.
- **Derived State:**
  - `staffName` - Memoized staff name from break (handle both string ID and populated IUser object)
  - `staffInitials` - Memoized staff initials for avatar fallback
  - `timeRange` - Formatted time range string

## UI Structure
- **Header Card:** Break time range and action buttons (Edit, Back to Breaks).
- **Break Details Card:** Staff information, staff email, start time, end time, and reason with icons.
- **System Information Card:** Created date and last updated date (if available) with icons.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Break Details                              │
│ [Avatar] Staff Name                        │
│ Time Range: 12:00 PM - 12:30 PM           │
│ [Reason Badge]                             │
│ [Edit Break] [Back to Breaks]              │
├────────────────────────────────────────────┤
│ Break Details                              │
│ Staff │ Start Time                        │
│ End Time │ Reason                         │
│ Created │ Updated                        │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Break Details                                       │
│ Jan 23, 2026, 12:00 PM - 12:30 PM                 │
│ [Edit Break] [Back to Breaks]                      │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 📄 Break Details                                    │
│ ─────────────────────────────────────────────────  │
│ 👤 Staff                                            │
│ John Doe                                            │
│                                                    │
│ 📧 Staff Email                                      │
│ john@example.com                                    │
│                                                    │
│ 🕐 Start Time                                       │
│ Jan 23, 2026, 12:00 PM                             │
│                                                    │
│ 🕐 End Time                                         │
│ Jan 23, 2026, 12:30 PM                             │
│                                                    │
│ 📄 Reason                                          │
│ Lunch                                               │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 📅 System Information                               │
│ ─────────────────────────────────────────────────  │
│ 📅 Created                                          │
│ Jan 23, 2026, 10:00 AM                             │
│                                                    │
│ 📅 Last Updated                                     │
│ Jan 23, 2026, 10:00 AM                             │
└────────────────────────────────────────────────────┘
```

## API Integration
- **Endpoint:** `GET /api/breaks/:breakId` via `useGetBreakById(breakId)`.
- **Response Structure:**
  ```typescript
  {
    success: true,
    data: {
      break: IBreak
    }
  }
  ```

## Components Used
- React Router DOM: `Link`, `useParams` for routing.
- React Icons: `FiUser`, `FiMail`, `FiClock`, `FiFileText`, `FiCalendar` for section icons.
- TanStack Query: `useGetBreakById` hook.
- Utility Functions: `formatBreakDateTime`, `formatFullDateTime`, `getStaffName`, `getStaffInitials` from `@/utils/breakUtils`.
- Tailwind CSS classes: `btn-primary`, `btn-secondary`, `rounded-2xl`, `border`, `shadow-sm`, `p-6`, `alert-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching break data.
- **Error State:** Display `alert-error` with API error message if fetch fails.
- **Not Found:** Display error message if break doesn't exist, with link back to break list.

## Navigation Flow
- Route: `/breaks/:id`.
- **Edit Button:** Navigate to `/breaks/:id/edit` (BreakEdit page).
- **Back to Breaks Button:** Navigate to `/breaks` (break list).

## Functions Involved
- **`getStaffName`** — Extracts staff name from break (handle both string ID and populated IUser object).
- **`getStaffInitials`** — Gets staff initials for avatar fallback.
- **`formatBreakTimeRange`** — Formats start and end times as a range.
- **`formatBreakDateTime`** — Formats ISO timestamps with time included.

## Future Enhancements
- Show related appointments that might be affected by this break.
- Display break duration calculation.
- Show break conflicts with other breaks or appointments.
- Activity log for break changes.
- Clone break functionality.
