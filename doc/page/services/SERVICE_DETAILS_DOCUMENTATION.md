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
import { useGetServiceById } from '../../../tanstack/useServices';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatDateTimeWithTime, formatPrice, formatDuration } from '../../../utils/serviceUtils';
import type { IService } from '../../../types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/services/:id`).
- **TanStack Query:** `useGetServiceById(id)` fetches service data for display.
- **Derived State:** Formatted values for display (price, duration, dates) computed via `useMemo`.

## UI Structure
- **Header Card:** Service name, status badge, and action buttons (Edit, Back to Services).
- **Service Information Card:** Name and description with icons.
- **Service Settings Card:** Duration, full price, and sort order with icons.
- **Status Information Card:** Active/inactive status with badge and icon.
- **System Information Card:** Created date and updated date with icons.

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
│ Service Details                                     │
│ Haircut                                             │
│ [Active Badge]                                      │
│ [Edit Service] [Back to Services]                   │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 🏷️ Service Information                               │
│ ─────────────────────────────────────────────────  │
│ 🏷️ Name                                             │
│ Haircut                                             │
│                                                    │
│ 📄 Description                                      │
│ Classic men haircut with styling                   │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ ⚙️ Service Settings                                  │
│ ─────────────────────────────────────────────────  │
│ 🕐 Duration                                         │
│ 30 minutes                                          │
│                                                    │
│ 💰 Full Price                                       │
│ KES 500.00                                          │
│                                                    │
│ 📊 Sort Order                                       │
│ 0                                                   │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ ✓ Status Information                                │
│ ─────────────────────────────────────────────────  │
│ ✓ Status                                            │
│ [Active Badge]                                      │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 📅 System Information                                │
│ ─────────────────────────────────────────────────  │
│ 📅 Created Date                                     │
│ Jan 01, 2025, 10:30 AM                              │
│                                                    │
│ 📅 Updated Date                                     │
│ Jan 15, 2025, 2:45 PM                               │
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
- React Icons: `FiTag`, `FiFileText`, `FiClock`, `FiDollarSign`, `FiList`, `FiCheckCircle`, `FiXCircle`, `FiCalendar`, `FiSettings` for section icons.
- TanStack Query: `useGetServiceById` hook.
- StatusBadge: For service status badge (active/inactive).
- Utility Functions: `formatDateTimeWithTime` from `@/utils/userUtils`, `formatPrice`, `formatDuration` from `@/utils/serviceUtils`.
- Tailwind CSS classes: `btn-primary`, `btn-secondary`, `rounded-2xl`, `border`, `shadow-sm`, `p-6`, `alert-error`.

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

