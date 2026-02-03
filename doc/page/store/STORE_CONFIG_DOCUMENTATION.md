# Store Configuration Screen Documentation

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
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useGetStoreConfiguration } from '@/tanstack/useStoreConfig';
```

## Context and State Management
- **TanStack Query:** `useGetStoreConfiguration()` fetches the latest store configuration payload.
- **Derived state:** formatted values (minutes to hours, reminder times, timestamps) are memoized from configuration data.

## UI Structure
- **Header block:** store icon/avatar, "Store Configuration" title, "Edit Configuration" button.
- **Details card:** appointment fee, booking settings, notification settings, business settings, timestamps.
- **Primary CTA:** `Edit Configuration` button.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Icon + Store Configuration                │
│                                            │
├────────────────────────────────────────────┤
│ Appointment Fee / Booking Settings         │
│ Notification Settings / Business Settings  │
│ Created / Updated                          │
├────────────────────────────────────────────┤
│ [Edit Configuration]                      │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ (🏪)  Store Configuration                         │
│                                                    │
│ Fee Type: FIXED        Fee Value: 200 KES          │
│ Min Booking Notice: 60 minutes                     │
│ Late Grace Period: 10 minutes                      │
│ Allow Walk-ins: Yes                                │
│                                                    │
│ Send SMS: Yes          Send Email: Yes             │
│ Send Push: No                                       │
│ Reminder Times: 1440, 120, 30 minutes before       │
│                                                    │
│ Timezone: Africa/Nairobi                           │
│ Created: Jan 01, 2025                              │
│ Updated: Feb 01, 2026                              │
│                                                    │
│ [Edit Configuration]                               │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **CTA link** (navigates to edit page):
  ```tsx
  <Link to="/store/edit" className="btn-primary">
    Edit Configuration
  </Link>
  ```

## API Integration
- **Endpoint:** `GET /api/store-configuration`.
- **Hook:** `useGetStoreConfiguration()` returns `data` containing `storeConfiguration` object.
- **Response structure:** `response.data.data.storeConfiguration`.

## Components Used
- React + React Router DOM: `Link`.
- Tailwind CSS utility classes: `btn-primary`, `badge`, `badge-success`, `badge-error`, `rounded-2xl`, `border`, `border-gray-200`, `bg-white`, `p-6`, `shadow-sm`.

## Error Handling
- If the query fails, display the API message from `error.response?.data?.message`.
- Show loading state while fetching configuration.
- Handle missing/null values with "—" fallback.

## Navigation Flow
- Route: `/store`.
- `Edit Configuration` ➞ `/store/edit`.

## Functions Involved
- **`formatDateTime`** — normalizes timestamps for display.
  ```tsx
  const formatDateTime = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };
  ```

- **`formatMinutes`** — converts minutes to readable format.
  ```tsx
  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  };
  ```

- **`formatReminderTimes`** — formats reminder times array for display.
  ```tsx
  const formatReminderTimes = (times: number[]) => {
    if (!times || times.length === 0) return '—';
    return times.map(t => formatMinutes(t)).join(', ');
  };
  ```

## Future Enhancements
- Add configuration history/audit log.
- Display configuration change notifications.
- Add preview of how settings affect appointment booking flow.
