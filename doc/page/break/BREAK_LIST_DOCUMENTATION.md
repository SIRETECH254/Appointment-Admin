# Break List Screen Documentation

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
import { useGetAllBreaks, useDeleteBreak } from '@/tanstack/useBreaks';
import { useGetAllUsers } from '@/tanstack/useUsers';
import Pagination from '@/components/ui/Pagination';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatBreakDateTime, formatBreakTimeRange, getStaffName, getStaffInitials } from '@/utils/breakUtils';
import type { IBreak } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetAllBreaks(params)` fetches paginated break list with filters and search.
- **Staff Users Query:** `useGetAllUsers({ role: 'staff' })` fetches staff members for filter dropdown.
- **Delete Mutation:** `useDeleteBreak()` handles break deletion with cache invalidation.
- **Local State:**
  - `searchTerm` - Current search input value
  - `debouncedSearch` - Debounced search value (500ms delay)
  - `filterStaff` - Selected staff filter (all staff or specific staff member)
  - `filterDateFrom` - Start date filter (optional)
  - `filterDateTo` - End date filter (optional)
  - `currentPage` - Current page number (default: 1)
  - `itemsPerPage` - Items per page (default: 10)
- **Derived State:** `params` memo combines filters, search, and pagination for API call.

## UI Structure
- **Toolbar:** Search input, staff filter dropdown, date range inputs (from/to), items per page selector, "Add Break" button.
- **Table:** HTML `<table>` element with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags. Header row with columns (Staff, Start Time, End Time, Reason, Created, Actions), data rows, loading skeleton rows, error/empty states. Horizontal scroll enabled when content overflows.
- **Pagination:** Component at bottom showing current page, total pages, and navigation controls.
- **Delete Modal:** Confirmation modal (`ConfirmModal`) for delete actions instead of browser alert.

## Planned Layout
```
┌────────────────────────────────────────────────────────────┐
│ [Search] [Staff Filter] [Date From] [Date To] [Items/Page]│
│                                                      [+Add] │
├────────────────────────────────────────────────────────────┤
│ Staff │ Start Time │ End Time │ Reason │ Created │ Actions│
├────────────────────────────────────────────────────────────┤
│ (Avatar) JD │ 12:00 PM │ 12:30 PM │ Lunch │ Date │ [V][E][D] │
│ ...                                                         │
├────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50        [Prev] [Next]      │
└────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔍 Search breaks...  [Staff: All ▼] [From: __/__/____] [To: __/__/____]│
│ [10 per page ▼]                                        [+ Add Break] │
├──────────────────────────────────────────────────────────────────────┤
│ Staff │ Start Time      │ End Time        │ Reason │ Created │ Actions│
├──────────────────────────────────────────────────────────────────────┤
│ ◯ JD  │ Jan 23, 12:00 PM│ Jan 23, 12:30 PM│ Lunch  │ Jan 23  │ 👁 ✏ 🗑 │
│ ◯ SM  │ Jan 23, 1:00 PM │ Jan 23, 1:30 PM │ Break  │ Jan 23  │ 👁 ✏ 🗑 │
│ ...                                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50              [← Prev] [Next →]     │
└──────────────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Text input with debounce (500ms) using `input-search` class. Searches by staff name or reason.
- **Staff Filter:** Select dropdown with options: All, and list of staff members fetched from API.
- **Date From:** Date input for filtering breaks from a specific date.
- **Date To:** Date input for filtering breaks to a specific date.
- **Items Per Page:** Select dropdown with options: 10, 25, 50, 100.
- **Add Break Button:** Primary button linking to `/breaks/new`.

## API Integration
- **Endpoint:** `GET /api/breaks` with query parameters (page, limit, search, staffId, date, from, to).
- **Hook:** `useGetAllBreaks(params)` returns paginated break data.
- **Response Structure:**
  ```typescript
  {
    success: true,
    data: {
      breaks: IBreak[]
    }
  }
  ```
- **Delete Endpoint:** `DELETE /api/breaks/:breakId` via `useDeleteBreak()` mutation.

## Components Used
- React Router DOM: `Link` for navigation.
- React Icons: `MdVisibility`, `MdEdit`, `MdDelete`, `MdAdd` for action buttons.
- TanStack Query: `useGetAllBreaks`, `useDeleteBreak`, `useGetAllUsers` hooks.
- Custom Components: `Pagination` component for pagination controls, `ConfirmModal` for delete confirmation.
- Utility Functions: `formatBreakDateTime`, `formatBreakTimeRange`, `getStaffName`, `getStaffInitials` from `@/utils/breakUtils`.
- Tailwind CSS classes: `input-search`, `btn-primary`, `btn-secondary`, `btn-sm`, `btn-ghost`, `badge-soft`, `alert-error`.

## Error Handling
- **Loading State:** Display 5 skeleton rows with `animate-pulse` effect in table body.
- **Error State:** Show inline `alert-error` with API error message from `error.response?.data?.message`.
- **Empty State:** Display "No breaks found" message when `breaks.length === 0`.
- **Delete Error:** Show error message if deletion fails, keep break in list.
- **Network Errors:** Gracefully handle network failures with user-friendly messages.

## Navigation Flow
- Route: `/breaks`.
- **View Action:** Navigate to `/breaks/:id` (BreakDetails page) using icon button with `MdVisibility` icon.
- **Edit Action:** Navigate to `/breaks/:id/edit` (BreakEdit page) using icon button with `MdEdit` icon.
- **Delete Action:** Opens `ConfirmModal` for confirmation, then deletes break and refreshes list. Uses `MdDelete` icon button.
- **Add Break Button:** Navigate to `/breaks/new` (BreakAdd page) with `MdAdd` icon.

## Functions Involved
- **`formatBreakDateTime`** — Formats ISO timestamps for display (from `@/utils/breakUtils`).
- **`formatBreakTimeRange`** — Formats start and end times as a range (from `@/utils/breakUtils`).
- **`getStaffName`** — Extracts staff name from break (handle both string ID and populated IUser object) (from `@/utils/breakUtils`).
- **`getStaffInitials`** — Gets staff initials for avatar fallback (from `@/utils/breakUtils`).
- **`handleDeleteClick`** — Opens delete confirmation modal.
- **`handleDeleteConfirm`** — Confirms and executes break deletion.
- **`debounceSearch`** — Debounces search input to reduce API calls.

## Implementation Details
- **Table Structure:** Uses semantic HTML `<table>` elements with proper `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags for accessibility.
- **Horizontal Scroll:** Table container has `overflow-x-auto` class with `min-w-[800px]` on table to enable horizontal scrolling when content overflows on smaller screens.
- **Delete Confirmation:** Uses `ConfirmModal` component instead of browser `window.confirm()` for better UX. Modal includes backdrop click and Escape key support.
- **Icons:** Action buttons use Material Design icons (`MdVisibility`, `MdEdit`, `MdDelete`) for visual clarity.
- **Utility Functions:** Reusable functions are imported from `@/utils/breakUtils` for consistency across components.
- **Staff Filter:** Fetches staff users via `useGetAllUsers({ role: 'staff' })` and populates dropdown filter.

## Future Enhancements
- Bulk actions (delete multiple breaks).
- Column sorting (by staff, start time, end time, created date).
- Export functionality (CSV/Excel download).
- Advanced filters (recurring breaks, reason filter).
- Calendar view for breaks.
- Break conflict detection and warnings.
