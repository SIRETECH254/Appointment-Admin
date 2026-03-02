# Newsletter List Screen Documentation

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
import { MdEmail, MdSend } from 'react-icons/md';
import { FiFilter, FiList, FiSearch, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useGetAllSubscribers, useDeleteSubscriber } from '@/tanstack/useNewsletters';
import Pagination from '@/components/ui/Pagination';
import ConfirmModal from '@/components/ui/ConfirmModal';
import StatusBadge from '@/components/ui/StatusBadge';
import type { INewsletter, IUser } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetAllSubscribers(params)` fetches paginated subscriber list with filters and search.
- **Delete Mutation:** `useDeleteSubscriber()` handles subscriber deletion with cache invalidation.
- **Local State:**
  - `searchTerm` - Current search input value
  - `debouncedSearch` - Debounced search value (500ms delay)
  - `filterStatus` - Selected status filter (all, SUBSCRIBED, UNSUBSCRIBED, BOUNCED)
  - `currentPage` - Current page number (default: 1)
  - `itemsPerPage` - Items per page (default: 10)
- **Derived State:** `params` memo combines filters, search, and pagination for API call.

## UI Structure
- **Toolbar:** Search input, status filter dropdown, items per page selector, "Send Newsletter" button.
- **Table:** HTML `<table>` element with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags. Header row with columns (Email, Status, Subscribed At, Source, User, Actions), data rows, loading skeleton rows, error/empty states. Horizontal scroll enabled when content overflows.
- **Pagination:** Component at bottom showing current page, total pages, and navigation controls.
- **Delete Modal:** Confirmation modal (`ConfirmModal`) for delete actions instead of browser alert.

## Planned Layout
```
┌────────────────────────────────────────────────────────────┐
│ [Search] [Status Filter] [Items/Page]              [Send]  │
├────────────────────────────────────────────────────────────┤
│ Email │ Status │ Subscribed At │ Source │ User │ Actions │
├────────────────────────────────────────────────────────────┤
│ email@example.com │ SUBSCRIBED │ Jan 23 │ WEBSITE │ John │ [V][E][D] │
│ ...                                                         │
├────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50        [Prev] [Next]      │
└────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔍 Search subscribers...  [Status: All ▼] [10 per page ▼]          │
│                                                      [Send Newsletter]│
├──────────────────────────────────────────────────────────────────────┤
│ Email │ Status │ Subscribed At │ Source │ User │ Actions            │
├──────────────────────────────────────────────────────────────────────┤
│ email@example.com │ ✓ SUBSCRIBED │ Jan 23, 2026 │ WEBSITE │ John │ 👁 ✏ 🗑 │
│ ...                                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50              [← Prev] [Next →]     │
└──────────────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Text input with debounce (500ms) using `input-search` class. Searches by email.
- **Status Filter:** Select dropdown with options: All, Subscribed, Unsubscribed, Bounced.
- **Items Per Page:** Select dropdown with options: 10, 25, 50, 100.
- **Send Newsletter Button:** Primary button linking to `/newsletters/send`.

## API Integration
- **Endpoint:** `GET /api/newsletter` with query parameters (page, limit, search, status).
- **Hook:** `useGetAllSubscribers(params)` returns paginated subscriber data.
- **Response Structure:**
  ```typescript
  {
    success: true,
    data: {
      subscribers: INewsletter[],
      pagination: {
        currentPage: number,
        totalPages: number,
        totalSubscribers: number,
        hasNextPage: boolean,
        hasPrevPage: boolean
      }
    }
  }
  ```
- **Delete Endpoint:** `DELETE /api/newsletter/:subscriberId` via `useDeleteSubscriber()` mutation.

## Components Used
- React Router DOM: `Link` for navigation.
- React Icons: `MdEmail`, `MdSend`, `FiFilter`, `FiList`, `FiSearch`, `FiEye`, `FiEdit2`, `FiTrash2` for action buttons.
- TanStack Query: `useGetAllSubscribers`, `useDeleteSubscriber` hooks.
- Custom Components: `Pagination` component for pagination controls, `ConfirmModal` for delete confirmation, `StatusBadge` for status display.
- Tailwind CSS classes: `input-search`, `btn-primary`, `btn-secondary`, `btn-sm`, `btn-ghost`, `badge-soft`, `alert-error`.

## Error Handling
- **Loading State:** Display 5 skeleton rows with `animate-pulse` effect in table body.
- **Error State:** Show inline `alert-error` with API error message from `error.response?.data?.message`.
- **Empty State:** Display "No subscribers found" message when `subscribers.length === 0`.
- **Delete Error:** Show error message if deletion fails, keep subscriber in list.
- **Network Errors:** Gracefully handle network failures with user-friendly messages.

## Navigation Flow
- Route: `/newsletters`.
- **View Action:** Navigate to `/newsletters/:id` (NewsletterDetails page) using icon button with `FiEye` icon.
- **Edit Action:** Navigate to `/newsletters/:id/edit` (NewsletterEdit page) using icon button with `FiEdit2` icon.
- **Delete Action:** Opens `ConfirmModal` for confirmation, then deletes subscriber and refreshes list. Uses `FiTrash2` icon button.
- **Send Newsletter Button:** Navigate to `/newsletters/send` (SendNewsletter page) with `MdSend` icon.

## Functions Involved
- **`formatDate`** — Formats ISO timestamps for display.
- **`getUserName`** — Extracts user name from subscriber (handle both string ID and populated IUser object).
- **`handleDeleteClick`** — Opens delete confirmation modal.
- **`handleDeleteConfirm`** — Confirms and executes subscriber deletion.
- **`debounceSearch`** — Debounces search input to reduce API calls.

## Implementation Details
- **Table Structure:** Uses semantic HTML `<table>` elements with proper `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags for accessibility.
- **Horizontal Scroll:** Table container has `overflow-x-auto` class with `min-w-[800px]` on table to enable horizontal scrolling when content overflows on smaller screens.
- **Delete Confirmation:** Uses `ConfirmModal` component instead of browser `window.confirm()` for better UX. Modal includes backdrop click and Escape key support.
- **Icons:** Action buttons use Material Design icons (`FiEye`, `FiEdit2`, `FiTrash2`) for visual clarity.
- **Status Display:** Uses `StatusBadge` component with `contact-status` type for consistent status display.

## Future Enhancements
- Bulk actions (delete multiple subscribers, update status for multiple).
- Column sorting (by email, subscribed date, status).
- Export functionality (CSV/Excel download).
- Advanced filters (source filter, date range filter).
- Subscriber tags management.
- Unsubscribe token management.
- Bulk import subscribers from CSV.
