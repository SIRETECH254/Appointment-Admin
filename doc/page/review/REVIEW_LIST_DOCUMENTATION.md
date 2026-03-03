# Review List Screen Documentation

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
import { FiFilter, FiList, FiSearch, FiEye, FiEdit2, FiTrash2, FiStar } from 'react-icons/fi';
import { useGetAllReviews, useDeleteReview, useUpdateReviewStatus } from '@/tanstack/useReviews';
import { useGetAllUsers } from '@/tanstack/useUsers';
import { useGetAllServices } from '@/tanstack/useServices';
import Pagination from '@/components/ui/Pagination';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatReviewDate, getUserName, getUserInitials, getStaffName, getServiceNames } from '@/utils/reviewUtils';
import type { IReview, IUser, ReviewStatus } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetAllReviews(params)` fetches paginated review list with filters and search.
- **Staff Users Query:** `useGetAllUsers({ role: 'staff' })` fetches staff members for filter dropdown.
- **Services Query:** `useGetAllServices()` fetches services for filter dropdown.
- **Delete Mutation:** `useDeleteReview()` handles review deletion with cache invalidation.
- **Status Update Mutation:** `useUpdateReviewStatus()` handles review status updates (admin only).
- **Local State:**
  - `searchTerm` - Current search input value
  - `debouncedSearch` - Debounced search value (500ms delay)
  - `filterStatus` - Selected status filter (all, PENDING, APPROVED, REJECTED)
  - `filterStaff` - Selected staff filter (all staff or specific staff member)
  - `filterService` - Selected service filter (all services or specific service)
  - `filterRating` - Selected rating filter (all, 1-5 stars)
  - `currentPage` - Current page number (default: 1)
  - `itemsPerPage` - Items per page (default: 10)
  - `deleteModalOpen` - Delete confirmation modal visibility
  - `reviewToDelete` - Review selected for deletion
  - `statusModalOpen` - Status update modal visibility
  - `reviewToUpdateStatus` - Review selected for status update
  - `newStatus` - New status value for status update
- **Derived State:** `params` memo combines filters, search, and pagination for API call.

## UI Structure
- **Header:** Title, description, search input, filter dropdowns (status, staff, service, rating), items per page selector.
- **Table:** HTML `<table>` element with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags. Header row with columns (User, Appointment Info, Rating, Comment, Status, Created, Actions), data rows, loading skeleton rows, error/empty states. Horizontal scroll enabled when content overflows.
- **Pagination:** Component at bottom showing current page, total pages, and navigation controls.
- **Delete Modal:** Confirmation modal (`ConfirmModal`) for delete actions instead of browser alert.
- **Status Update Modal:** Custom modal for updating review status (admin only).

## Planned Layout
```
┌────────────────────────────────────────────────────────────────────┐
│ [Search] [Status Filter] [Staff Filter] [Service Filter] [Rating]  │
│ [Items/Page]                                                         │
├────────────────────────────────────────────────────────────────────┤
│ User │ Appointment Info │ Rating │ Comment │ Status │ Created │ Actions│
├────────────────────────────────────────────────────────────────────┤
│ (Avatar) JD │ Staff: Jane, Services: Haircut │ ⭐⭐⭐⭐⭐ │ Great! │ Approved │ Date │ [V][S][D] │
│ ...                                                                 │
├────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50        [Prev] [Next]              │
└────────────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔍 Search reviews...  [Status: All ▼] [Staff: All ▼] [Service: All ▼]│
│ [Rating: All ▼] [10 per page ▼]                                      │
├──────────────────────────────────────────────────────────────────────┤
│ User │ Appointment Info │ Rating │ Comment │ Status │ Created │ Actions│
├──────────────────────────────────────────────────────────────────────┤
│ ◯ JD  │ Staff: Jane Doe │ ⭐⭐⭐⭐⭐ │ Great service! │ Approved │ Jan 23  │ 👁 🔄 🗑 │
│      │ Services: Haircut │        │                │          │         │          │
│ ◯ SM  │ Staff: John Smith│ ⭐⭐⭐⭐ │ Good experience│ Pending │ Jan 22  │ 👁 🔄 🗑 │
│      │ Services: Massage │        │                │          │         │          │
│ ...                                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50              [← Prev] [Next →]     │
└──────────────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Text input with debounce (500ms) using `input-search` class. Searches by user name, comment, or rating.
- **Status Filter:** Select dropdown with options: All, Pending, Approved, Rejected.
- **Staff Filter:** Select dropdown with options: All, and list of staff members fetched from API.
- **Service Filter:** Select dropdown with options: All, and list of services fetched from API.
- **Rating Filter:** Select dropdown with options: All, 5 Stars, 4 Stars, 3 Stars, 2 Stars, 1 Star.
- **Items Per Page:** Select dropdown with options: 5, 10, 25, 50, 100.

## API Integration
- **Endpoint:** `GET /api/reviews` with query parameters (page, limit, search, status, staffId, serviceId, userId, appointmentId).
- **Hook:** `useGetAllReviews(params)` returns paginated review data.
- **Response Structure:**
  ```typescript
  {
    success: true,
    data: {
      reviews: IReview[],
      pagination: {
        currentPage: number,
        totalPages: number,
        totalReviews: number,
        hasNextPage: boolean,
        hasPrevPage: boolean
      },
      averageRating: number
    }
  }
  ```
- **Delete Endpoint:** `DELETE /api/reviews/:reviewId` via `useDeleteReview()` mutation.
- **Status Update Endpoint:** `PATCH /api/reviews/:reviewId/status` via `useUpdateReviewStatus()` mutation (admin only).

## Components Used
- React Router DOM: `Link` for navigation.
- React Icons: `FiFilter`, `FiList`, `FiSearch`, `FiEye`, `FiTrash2`, `FiStar` for action buttons and filters.
- TanStack Query: `useGetAllReviews`, `useDeleteReview`, `useUpdateReviewStatus`, `useGetAllUsers`, `useGetAllServices` hooks.
- Custom Components: `Pagination` component for pagination controls, `ConfirmModal` for delete confirmation.
- Custom Star Rating Component: `StarRating` component for displaying ratings (1-5 stars).
- Utility Functions: `formatReviewDate`, `getUserName`, `getUserInitials`, `getStaffName`, `getServiceNames` from `@/utils/reviewUtils`.
- Tailwind CSS classes: `input-search`, `input-select`, `btn-primary`, `btn-secondary`, `badge-soft`, `badge-success`, `badge-error`, `alert-error`, `table-container`, `table`, `table-header`, `table-cell`.

## Error Handling
- **Loading State:** Display 5 skeleton rows with `animate-pulse` effect in table body.
- **Error State:** Show inline `alert-error` with API error message from `error.response?.data?.message`.
- **Empty State:** Display "No reviews found" message when `reviews.length === 0`.
- **Delete Error:** Show error message if deletion fails, keep review in list.
- **Status Update Error:** Show error message if status update fails, keep original status.
- **Network Errors:** Gracefully handle network failures with user-friendly messages.

## Navigation Flow
- Route: `/reviews`.
- **View Action:** Navigate to `/reviews/:id` (ReviewDetails page) using icon button with `FiEye` icon.
- **Status Update Action:** Opens custom status update modal for admin to change review status (PENDING/APPROVED/REJECTED). Uses `FiFilter` icon button.
- **Delete Action:** Opens `ConfirmModal` for confirmation, then deletes review and refreshes list. Uses `FiTrash2` icon button.

## Functions Involved
- **`formatReviewDate`** — Formats ISO date strings for display (from `@/utils/reviewUtils`).
- **`getUserName`** — Extracts user name from review (handle both string ID and populated IUser object) (from `@/utils/reviewUtils`).
- **`getUserInitials`** — Gets user initials for avatar fallback (from `@/utils/reviewUtils`).
- **`getStaffName`** — Extracts staff name from review's appointment (from `@/utils/reviewUtils`).
- **`getServiceNames`** — Extracts service names from review's appointment (from `@/utils/reviewUtils`).
- **`handleDeleteClick`** — Opens delete confirmation modal.
- **`handleDeleteConfirm`** — Confirms and executes review deletion.
- **`handleStatusClick`** — Opens status update modal.
- **`handleStatusConfirm`** — Confirms and executes status update.
- **`debounceSearch`** — Debounces search input to reduce API calls.
- **`StarRating`** — Component that displays rating as filled/empty stars (1-5).

## Implementation Details
- **Table Structure:** Uses semantic HTML `<table>` elements with proper `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags for accessibility.
- **Horizontal Scroll:** Table container has `overflow-x-auto` class with `min-w-[800px]` on table to enable horizontal scrolling when content overflows on smaller screens.
- **Delete Confirmation:** Uses `ConfirmModal` component instead of browser `window.confirm()` for better UX. Modal includes backdrop click and Escape key support.
- **Status Update Modal:** Custom modal implementation for status updates with inline select dropdown.
- **Star Rating Display:** Custom `StarRating` component using `FiStar` icons with filled/empty states based on rating value.
- **Status Badges:** Uses `badge-success` (Approved), `badge-soft` (Pending), `badge-error` (Rejected) classes.
- **Icons:** Action buttons use Feather icons (`FiEye`, `FiTrash2`, `FiFilter`) for visual clarity.
- **Utility Functions:** Reusable functions are imported from `@/utils/reviewUtils` for consistency across components.
- **Staff Filter:** Fetches staff users via `useGetAllUsers({ role: 'staff' })` and populates dropdown filter.
- **Service Filter:** Fetches services via `useGetAllServices()` and populates dropdown filter.

## Future Enhancements
- Bulk actions (delete multiple reviews, bulk status updates).
- Column sorting (by user, rating, status, created date).
- Export functionality (CSV/Excel download).
- Advanced filters (date range, rating range).
- Review moderation queue for pending reviews.
- Review analytics and insights dashboard.
- Reply to reviews functionality.
- Review helpfulness voting.
