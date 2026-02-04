# Service Details Screen Documentation

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
import { useGetServiceById } from '@/tanstack/useServices';
import { formatDateTimeWithTime, formatPrice, formatDuration } from '@/utils/serviceUtils';
import type { IService } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/services/:id`).
- **TanStack Query:** `useGetServiceById(id)` fetches service data for display.
- **Derived State:** Formatted values for display (price, duration, dates) computed via `useMemo`.

## UI Structure
- **Header Card:** Service name, status badge, and action buttons (Edit, Back to Services).
- **Details Card:** Two-column grid layout displaying service information.
- **Information Sections:** Basic details (name, description), pricing (full price), timing (duration), ordering (sort order), status, and timestamps (created, updated).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Service Name                    [Status]   │
│                                            │
│ [Edit Service]  [Back to Services]        │
├────────────────────────────────────────────┤
│ Service Details                            │
│ Name │ Description                         │
│ Duration │ Full Price                      │
│ Sort Order │ Status                        │
│ Created │ Updated                          │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Haircut                              [Active]      │
│                                                    │
│ [Edit Service]              [Back to Services]    │
├────────────────────────────────────────────────────┤
│ Service Details                                    │
│                                                    │
│ Name: Haircut                                      │
│ Description: Classic men haircut with styling     │
│ Duration: 30 min                                   │
│ Full Price: KES 500                                │
│ Sort Order: 1                                      │
│ Status: Active                                     │
│ Created: Jan 01, 2025, 10:30 AM                    │
│ Updated: Jan 15, 2025, 2:45 PM                     │
└────────────────────────────────────────────────────┘
```

## API Integration
- **Get Endpoint:** `GET /api/services/:serviceId` via `useGetServiceById(serviceId)`.
- **Response Structure:**
  ```typescript
  {
    success: true,
    data: {
      service: IService
    }
  }
  ```
- **Service Object:**
  ```typescript
  {
    _id: string,
    name: string,
    description?: string,
    duration: number, // minutes
    fullPrice: number,
    sortOrder: number,
    isActive: boolean,
    createdAt: string,
    updatedAt: string
  }
  ```

## Components Used
- React Router DOM: `Link`, `useParams` for routing.
- TanStack Query: `useGetServiceById` hook.
- Utility Functions: `formatDateTimeWithTime`, `formatPrice`, `formatDuration` from `@/utils/serviceUtils`.
- Tailwind CSS classes: `btn-primary`, `btn-secondary`, `badge-success`, `badge-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching service data.
- **Error State:** Display `alert-error` with API error message if fetch fails.
- **Not Found:** Display error message if service doesn't exist, with link back to service list.

## Navigation Flow
- Route: `/services/:id`.
- **Edit Button:** Navigate to `/services/:id/edit` (ServiceEdit page).
- **Back to Services Button:** Navigate to `/services` (ServiceList page).

## Functions Involved
- **`formatDateTimeWithTime`** — Formats ISO timestamps with time included (from `@/utils/serviceUtils`).
  ```tsx
  import { formatDateTimeWithTime } from '@/utils/serviceUtils';
  // Usage: formatDateTimeWithTime(service.createdAt)
  ```

- **`formatPrice`** — Formats currency amounts for display (from `@/utils/serviceUtils`).
  ```tsx
  import { formatPrice } from '@/utils/serviceUtils';
  // Usage: formatPrice(service.fullPrice)
  ```

- **`formatDuration`** — Formats duration in minutes to readable format (from `@/utils/serviceUtils`).
  ```tsx
  import { formatDuration } from '@/utils/serviceUtils';
  // Usage: formatDuration(service.duration)
  ```

## Implementation Details
- **Header Card:** Displays service name prominently with status badge. Action buttons aligned to the right.
- **Details Grid:** Two-column responsive grid that stacks on mobile devices.
- **Field Labels:** Uppercase small text labels for each field value.
- **Status Badge:** Color-coded badge (green for active, red for inactive).
- **Date Formatting:** Both created and updated dates show full date and time.

## Future Enhancements
- Service usage statistics (number of appointments, revenue generated).
- Related services suggestions.
- Service history/audit log.
- Service image gallery.
- Customer reviews and ratings display.
- Service availability calendar view.

