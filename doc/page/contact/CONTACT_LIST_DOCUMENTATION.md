# Contact List Screen Documentation

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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdVisibility, MdReply, MdEdit } from 'react-icons/md';
import { useGetAllContactMessages, useUpdateContactStatus } from '@/tanstack/useContact';
import Pagination from '@/components/ui/Pagination';
import { formatDateTime, getStatusBadgeClass, getStatusDisplayName } from '@/utils/contactUtils';
import type { IContact, ContactStatus } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetAllContactMessages(params)` fetches paginated contact list with filters and search.
- **Update Status Mutation:** `useUpdateContactStatus()` handles contact status updates with cache invalidation.
- **Local State:**
  - `searchTerm` - Current search input value
  - `debouncedSearch` - Debounced search value (500ms delay)
  - `filterStatus` - Selected status filter (all/new/read/replied/archived)
  - `currentPage` - Current page number (default: 1)
  - `itemsPerPage` - Items per page (default: 10)
- **Derived State:** `params` memo combines filters, search, and pagination for API call.

## UI Structure
- **Toolbar:** Search input, status filter dropdown, items per page selector.
- **Contact Cards:** Card-based layout (no table) displaying contacts with name, email, subject, message preview, status badge, timestamp, and action buttons. Cards are clickable to navigate to detail view.
- **Pagination:** Component at bottom showing current page, total pages, and navigation controls.

## Planned Layout
```
┌────────────────────────────────────────────────────────────┐
│ [Search] [Status Filter] [Items/Page]                     │
├────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [NEW] Subject                    [View] [Reply]      │ │
│ │ From: Name <email@example.com>                       │ │
│ │ Message preview...                                   │ │
│ │ Created: Date                                        │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [REPLIED] Subject                  [View] [Reply]    │ │
│ │ From: Name <email@example.com>                       │ │
│ │ Message preview...                                   │ │
│ │ Created: Date                                        │ │
│ └──────────────────────────────────────────────────────┘ │
│ ...                                                       │
├────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50        [Prev] [Next]      │
└────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔍 Search contacts...  [Status: All ▼] [10 per page ▼]             │
├──────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ [NEW] Booking Enquiry                      [👁] [✉ Reply]      │ │
│ │ From: John Doe <john@example.com>                              │ │
│ │ I would like to know your availability next week.               │ │
│ │ Created: Jan 15, 2025 10:30 AM                                 │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ [REPLIED] Question About Services            [👁] [✉ Reply]    │ │
│ │ From: Jane Smith <jane@example.com>                            │ │
│ │ When do you open?                                               │ │
│ │ Created: Jan 14, 2025 2:15 PM                                  │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ [READ] General Inquiry                      [👁] [✉ Reply]     │ │
│ │ From: Bob Johnson <bob@example.com>                           │ │
│ │ I have a question about your services.                          │ │
│ │ Created: Jan 13, 2025 9:00 AM                                 │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ ...                                                                 │
├──────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50              [← Prev] [Next →]     │
└──────────────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Text input with debounce (500ms) using `input-search` class. Searches across name, email, and subject fields.
- **Status Filter:** Select dropdown with options: All, New, Read, Replied, Archived.
- **Items Per Page:** Select dropdown with options: 10, 25, 50, 100.

## API Integration
- **Endpoint:** `GET /api/contact` with query parameters (page, limit, search, status).
- **Hook:** `useGetAllContactMessages(params)` returns paginated contact data.
- **Response Structure:**
  ```typescript
  {
    contacts: IContact[],
    pagination?: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
  ```
- **Update Status Endpoint:** `PATCH /api/contact/:contactId/status` via `useUpdateContactStatus()` mutation.

## Components Used
- React Router DOM: `Link` for navigation.
- React Icons: `MdVisibility`, `MdReply`, `MdEdit` for action buttons.
- TanStack Query: `useGetAllContactMessages`, `useUpdateContactStatus` hooks.
- Custom Components: `Pagination` component for pagination controls.
- Utility Functions: `formatDateTime`, `getStatusBadgeClass`, `getStatusDisplayName` from `@/utils/contactUtils`.
- Tailwind CSS classes: `input-search`, `input-select`, `btn-primary`, `btn-secondary`, `btn-sm`, `btn-ghost`, `badge-soft`, `badge-success`, `badge-error`, `alert-error`.

## Error Handling
- **Loading State:** Display skeleton cards with `animate-pulse` effect.
- **Error State:** Show inline `alert-error` with API error message from `error.response?.data?.message`.
- **Empty State:** Display "No contacts found" message when `contacts.length === 0`.
- **Update Status Error:** Show error message if status update fails, keep contact in list.
- **Network Errors:** Gracefully handle network failures with user-friendly messages.

## Navigation Flow
- Route: `/contact`.
- **Card Click:** Navigate to `/contact/:id` (ContactDetails page).
- **View Action:** Navigate to `/contact/:id` (ContactDetails page) using icon button with `MdVisibility` icon.
- **Reply Action:** Navigate to `/contact/:id/reply` (ContactReply page) using icon button with `MdReply` icon.

## Functions Involved
- **`formatDateTime`** — Formats ISO timestamps for display (from `@/utils/contactUtils`).
  ```tsx
  import { formatDateTime } from '@/utils/contactUtils';
  // Usage: formatDateTime(contact.createdAt)
  ```

- **`getStatusBadgeClass`** — Returns badge class based on contact status (from `@/utils/contactUtils`).
  ```tsx
  import { getStatusBadgeClass } from '@/utils/contactUtils';
  // Usage: getStatusBadgeClass(contact.status)
  ```

- **`getStatusDisplayName`** — Gets display name for contact status (from `@/utils/contactUtils`).
  ```tsx
  import { getStatusDisplayName } from '@/utils/contactUtils';
  // Usage: getStatusDisplayName(contact.status)
  ```

- **`handleStatusChange`** — Updates contact status via mutation.
  ```tsx
  const handleStatusChange = useCallback(async (contactId: string, status: ContactStatus) => {
    try {
      await updateStatus.mutateAsync({
        contactId,
        statusData: { status }
      });
    } catch (error) {
      // Error handled by mutation onError
    }
  }, [updateStatus]);
  ```

- **`debounceSearch`** — Debounces search input to reduce API calls.
  ```tsx
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  ```

## Implementation Details
- **Card Layout:** Uses card-based layout instead of table for better mobile responsiveness and visual hierarchy.
- **Status Badges:** Color-coded badges (new: blue, read: gray, replied: green, archived: muted).
- **Message Preview:** Truncated message text with line-clamp for consistent card height.
- **Quick Status Update:** Optional dropdown or button group on each card for quick status changes (if needed).
- **Icons:** Action buttons use Material Design icons (`MdVisibility`, `MdReply`) for visual clarity.
- **Utility Functions:** Reusable functions (`formatDateTime`, `getStatusBadgeClass`, `getStatusDisplayName`) are imported from `@/utils/contactUtils` for consistency across components.

## Future Enhancements
- Bulk actions (mark multiple as read, archive multiple).
- Contact grouping by date (Today, Yesterday, This Week, etc.).
- Export functionality (CSV/Excel download).
- Advanced filters (date range, email domain filter).
- Quick reply modal from list view.
- Contact assignment to staff members.
