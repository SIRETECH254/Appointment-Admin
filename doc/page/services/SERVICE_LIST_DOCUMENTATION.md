# Service List Screen Documentation

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
import { MdVisibility, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useGetAllServices, useDeleteService } from '@/tanstack/useServices';
import Pagination from '@/components/ui/Pagination';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatDateTime, formatPrice, formatDuration } from '@/utils/serviceUtils';
import type { IService } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetAllServices(params)` fetches paginated service list with filters and search.
- **Delete Mutation:** `useDeleteService()` handles service deletion with cache invalidation.
- **Local State:**
  - `searchTerm` - Current search input value
  - `debouncedSearch` - Debounced search value (500ms delay)
  - `filterStatus` - Selected status filter (all/active/inactive)
  - `currentPage` - Current page number (default: 1)
  - `itemsPerPage` - Items per page (default: 10)
- **Derived State:** `params` memo combines filters, search, and pagination for API call.

## UI Structure
- **Toolbar:** Search input, status filter dropdown, items per page selector, "Add Service" button.
- **Table:** HTML `<table>` element with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags. Header row with columns (Name, Description, Duration, Price, Status, Created, Actions), data rows, loading skeleton rows, error/empty states. Horizontal scroll enabled when content overflows.
- **Pagination:** Component at bottom showing current page, total pages, and navigation controls.
- **Delete Modal:** Confirmation modal (`ConfirmModal`) for delete actions instead of browser alert.

## Planned Layout
```
┌────────────────────────────────────────────────────────────┐
│ [Search] [Status Filter] [Items/Page] [+Add]               │
├────────────────────────────────────────────────────────────┤
│ Name │ Description │ Duration │ Price │ Status │ Created │ Actions │
├────────────────────────────────────────────────────────────┤
│ Haircut │ Classic... │ 30 min │ KES 500 │ Active │ Date │ [V][E][D] │
│ ...                                                         │
├────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50        [Prev] [Next]      │
└────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔍 Search services...  [Status: All ▼] [10 per page ▼]              │
│                                                          [+ Add Service] │
├──────────────────────────────────────────────────────────────────────┤
│ Name │ Description │ Duration │ Price │ Status │ Created │ Actions  │
├──────────────────────────────────────────────────────────────────────┤
│ Haircut │ Classic men... │ 30 min │ KES 500 │ Active │ Jan 01,25 │ 👁 ✏ 🗑 │
│ Massage │ Full body... │ 60 min │ KES 1000 │ Active │ Jan 02,25 │ 👁 ✏ 🗑 │
│ Facial  │ Deep clean... │ 45 min │ KES 800  │ Inact. │ Jan 03,25 │ 👁 ✏ 🗑 │
│ ...                                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50              [← Prev] [Next →]       │
└──────────────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Text input with debounce (500ms) using `input-search` class.
- **Status Filter:** Select dropdown with options: All, Active, Inactive.
- **Items Per Page:** Select dropdown with options: 10, 25, 50, 100.
- **Add Service Button:** Primary button linking to `/services/new`.

## API Integration
- **Endpoint:** `GET /api/services` with query parameters (page, limit, search, status).
- **Hook:** `useGetAllServices(params)` returns paginated service data.
- **Response Structure:**
  ```typescript
  {
    services: IService[],
    pagination?: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
  ```
- **Delete Endpoint:** `DELETE /api/services/:serviceId` via `useDeleteService()` mutation.

## Components Used
- React Router DOM: `Link` for navigation.
- React Icons: `MdVisibility`, `MdEdit`, `MdDelete`, `MdAdd` for action buttons.
- TanStack Query: `useGetAllServices`, `useDeleteService` hooks.
- Custom Components: `Pagination` component for pagination controls, `ConfirmModal` for delete confirmation.
- Utility Functions: `formatDateTime`, `formatPrice`, `formatDuration` from `@/utils/serviceUtils`.
- Tailwind CSS classes: `input-search`, `btn-primary`, `btn-secondary`, `btn-sm`, `btn-ghost`, `badge-success`, `badge-error`, `alert-error`.

## Error Handling
- **Loading State:** Display 5 skeleton rows with `animate-pulse` effect in table body.
- **Error State:** Show inline `alert-error` with API error message from `error.response?.data?.message`.
- **Empty State:** Display "No services found" message when `services.length === 0`.
- **Delete Error:** Show error message if deletion fails, keep service in list.
- **Network Errors:** Gracefully handle network failures with user-friendly messages.

## Navigation Flow
- Route: `/services`.
- **View Action:** Navigate to `/services/:id` (ServiceDetails page) using icon button with `MdVisibility` icon.
- **Edit Action:** Navigate to `/services/:id/edit` (ServiceEdit page) using icon button with `MdEdit` icon.
- **Delete Action:** Opens `ConfirmModal` for confirmation, then deletes service and refreshes list. Uses `MdDelete` icon button.
- **Add Service Button:** Navigate to `/services/new` (ServiceAdd page) with `MdAdd` icon.

## Functions Involved
- **`formatDateTime`** — Formats ISO timestamps for display (from `@/utils/serviceUtils`).
  ```tsx
  import { formatDateTime } from '@/utils/serviceUtils';
  // Usage: formatDateTime(service.createdAt)
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

- **`handleDeleteClick`** — Opens delete confirmation modal.
  ```tsx
  const handleDeleteClick = useCallback((serviceId: string, serviceName: string) => {
    setServiceToDelete({ id: serviceId, name: serviceName });
    setDeleteModalOpen(true);
  }, []);
  ```

- **`handleDeleteConfirm`** — Confirms and executes service deletion.
  ```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!serviceToDelete) return;
    try {
      await deleteService.mutateAsync(serviceToDelete.id);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (deleteError) {
      // Error handled by mutation onError
    }
  }, [serviceToDelete, deleteService]);
  ```

- **`debounceSearch`** — Debounces search input to reduce API calls.
  ```tsx
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  ```

## Implementation Details
- **Table Structure:** Uses semantic HTML `<table>` elements with proper `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags for accessibility.
- **Horizontal Scroll:** Table container has `overflow-x-auto` class with `min-w-[800px]` on table to enable horizontal scrolling when content overflows on smaller screens.
- **Delete Confirmation:** Uses `ConfirmModal` component instead of browser `window.confirm()` for better UX. Modal includes backdrop click and Escape key support.
- **Icons:** Action buttons use Material Design icons (`MdVisibility`, `MdEdit`, `MdDelete`) for visual clarity.
- **Utility Functions:** Reusable functions (`formatDateTime`, `formatPrice`, `formatDuration`) are imported from `@/utils/serviceUtils` for consistency across components.

## Future Enhancements
- Bulk actions (activate/deactivate multiple services).
- Column sorting (by name, price, duration, status, created date).
- Export functionality (CSV/Excel download).
- Advanced filters (price range, duration range, date range).
- Service category/grouping functionality.
- Service analytics and usage tracking.

