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
import { useGetBreakById } from '@/tanstack/useBreaks';
import { formatBreakDateTime, formatBreakTimeRange, getStaffName, getStaffInitials } from '@/utils/breakUtils';
import type { IBreak } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/breaks/:id`).
- **TanStack Query:** `useGetBreakById(id)` fetches break data for display.
- **Derived State:**
  - `staffName` - Memoized staff name from break (handle both string ID and populated IUser object)
  - `staffInitials` - Memoized staff initials for avatar fallback
  - `timeRange` - Formatted time range string

## UI Structure
- **Header Card:** Staff name with avatar/initials, break time range, reason badge.
- **Details Card:** Two-column grid showing staff info, start/end times, reason, created/updated dates.
- **Actions:** Edit button linking to `/breaks/:id/edit`, Back to list button.

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
│ Break Details                                      │
│                                                    │
│ [JD] John Doe                                      │
│ Jan 23, 2026, 12:00 PM - 12:30 PM                 │
│ [Lunch]                                            │
│                                                    │
│ [Edit Break]              [Back to Breaks]         │
│                                                    │
│ ────────────────────────────────────────────────  │
│                                                    │
│ Break Details                                      │
│                                                    │
│ Staff: John Doe                                    │
│ Start Time: Jan 23, 2026, 12:00 PM                 │
│ End Time: Jan 23, 2026, 12:30 PM                  │
│ Reason: Lunch                                      │
│ Created: Jan 23, 2026, 10:00 AM                   │
│ Updated: Jan 23, 2026, 10:00 AM                   │
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
- TanStack Query: `useGetBreakById` hook.
- Utility Functions: `formatBreakDateTime`, `formatBreakTimeRange`, `getStaffName`, `getStaffInitials` from `@/utils/breakUtils`.
- Tailwind CSS classes: `btn-primary`, `btn-secondary`, `badge`, `badge-soft`, `alert-error`.

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
