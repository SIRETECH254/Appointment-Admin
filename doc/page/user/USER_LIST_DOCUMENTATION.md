# User List Screen Documentation

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
import { MdAdd } from 'react-icons/md';
import { FiSearch, FiFilter, FiList, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useGetAllUsers, useDeleteUser } from '../../../tanstack/useUsers';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatDateTime, getUserInitials } from '../../../utils/userUtils';
import type { IUser } from '../../../types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetAllUsers(params)` fetches paginated user list with filters and search.
- **Delete Mutation:** `useDeleteUser()` handles user deletion with cache invalidation.
- **Local State:**
  - `searchTerm` - Current search input value
  - `debouncedSearch` - Debounced search value (500ms delay)
  - `filterRole` - Selected role filter (all roles or specific role)
  - `filterStatus` - Selected status filter (all/active/inactive)
  - `currentPage` - Current page number (default: 1)
  - `itemsPerPage` - Items per page (default: 10)
- **Derived State:** `params` memo combines filters, search, and pagination for API call.

## UI Structure
- **Toolbar:** Search input, role filter dropdown, status filter dropdown, items per page selector, "Add User" button.
- **Table:** Uses `table-container`, `table`, `table-header`, `table-body`, `table-row`, `table-cell` classes. Header row with columns (Avatar/Name, Email, Role, Status, Created, Actions). Uses `StatusBadge` component for status display. Data rows, loading skeleton rows, error/empty states. Horizontal scroll enabled when content overflows.
- **Pagination:** Component at bottom showing current page, total pages, and navigation controls.
- **Delete Modal:** Confirmation modal (`ConfirmModal`) for delete actions instead of browser alert.

## Planned Layout
```
┌────────────────────────────────────────────────────────────┐
│ [Search] [Role Filter] [Status Filter] [Items/Page] [+Add]│
├────────────────────────────────────────────────────────────┤
│ Avatar/Name │ Email │ Role │ Status │ Created │ Actions    │
├────────────────────────────────────────────────────────────┤
│ (Avatar) JD │ email │ Admin│ Active │ Date    │ [V][E][D] │
│ ...                                                         │
├────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50        [Prev] [Next]      │
└────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔍 Search users...  [Role: All ▼] [Status: All ▼] [10 per page ▼]   │
│                                                          [+ Add User] │
├──────────────────────────────────────────────────────────────────────┤
│ Avatar │ Email              │ Role  │ Status │ Created    │ Actions  │
├──────────────────────────────────────────────────────────────────────┤
│ ◯ JD   │ john@example.com   │ Admin │ Active │ Jan 01,25  │ 👁 ✏ 🗑 │
│ ◯ SM   │ sarah@example.com  │ Staff │ Active │ Jan 02,25  │ 👁 ✏ 🗑 │
│ ◯ CD   │ client@example.com │ Client│ Inact. │ Jan 03,25  │ 👁 ✏ 🗑 │
│ ...                                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50              [← Prev] [Next →]     │
└──────────────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Text input with debounce (500ms) using `input-search` class.
- **Role Filter:** Select dropdown with options: All, Admin, Staff, Customer, etc.
- **Status Filter:** Select dropdown with options: All, Active, Inactive.
- **Items Per Page:** Select dropdown with options: 10, 25, 50, 100.
- **Add User Button:** Primary button linking to `/users/new`.

## API Integration
- **Endpoint:** `GET /api/users` with query parameters (page, limit, search, role, status).
- **Hook:** `useGetAllUsers(params)` returns paginated user data.
- **Response Structure:**
  ```typescript
  {
    items: IUser[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
  ```
- **Delete Endpoint:** `DELETE /api/users/:userId` via `useDeleteUser()` mutation.

## Components Used
- React Router DOM: `Link` for navigation.
- React Icons: `MdVisibility`, `MdEdit`, `MdDelete`, `MdAdd` for action buttons.
- TanStack Query: `useGetAllUsers`, `useDeleteUser` hooks.
- Custom Components: `Pagination` component for pagination controls, `ConfirmModal` for delete confirmation.
- Utility Functions: `formatDateTime`, `getUserInitials` from `../../../utils/userUtils`.
- Custom Components: `StatusBadge` for status display.
- Tailwind CSS classes: `input-search`, `btn-primary`, `btn-secondary`, `btn-sm`, `btn-ghost`, `badge-soft`, `badge-success`, `badge-error`, `alert-error`.

## Error Handling
- **Loading State:** Display 5 skeleton rows with `animate-pulse` effect in table body.
- **Error State:** Show inline `alert-error` with API error message from `error.response?.data?.message`.
- **Empty State:** Display "No users found" message when `items.length === 0`.
- **Delete Error:** Show error message if deletion fails, keep user in list.
- **Network Errors:** Gracefully handle network failures with user-friendly messages.

## Navigation Flow
- Route: `/users`.
- **View Action:** Navigate to `/users/:id` (UserDetails page) using icon button with `MdVisibility` icon.
- **Edit Action:** Navigate to `/users/:id/edit` (UserEdit page) using icon button with `MdEdit` icon.
- **Delete Action:** Opens `ConfirmModal` for confirmation, then deletes user and refreshes list. Uses `MdDelete` icon button.
- **Add User Button:** Navigate to `/users/new` (UserAdd page) with `MdAdd` icon.

## Functions Involved
- **`formatDateTime`** — Formats ISO timestamps for display (from `@/utils/userUtils`).
  ```tsx
  import { formatDateTime } from '@/utils/userUtils';
  // Usage: formatDateTime(user.createdAt)
  ```

- **`getUserInitials`** — Extracts initials from user name for avatar fallback (from `@/utils/userUtils`).
  ```tsx
  import { getUserInitials } from '@/utils/userUtils';
  // Usage: getUserInitials(user)
  ```

- **`getRoleDisplayName`** — Gets primary role display name (from `@/utils/userUtils`).
  ```tsx
  import { getRoleDisplayName } from '@/utils/userUtils';
  // Usage: getRoleDisplayName(user)
  ```

- **`handleDeleteClick`** — Opens delete confirmation modal.
  ```tsx
  const handleDeleteClick = useCallback((userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteModalOpen(true);
  }, []);
  ```

- **`handleDeleteConfirm`** — Confirms and executes user deletion.
  ```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return;
    try {
      await deleteUser.mutateAsync(userToDelete.id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (deleteError) {
      // Error handled by mutation onError
    }
  }, [userToDelete, deleteUser]);
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
- **Utility Functions:** Reusable functions (`formatDateTime`, `getUserInitials`, `getRoleDisplayName`) are imported from `@/utils/userUtils` for consistency across components.

## Future Enhancements
- Bulk actions (activate/deactivate multiple users, assign roles).
- Column sorting (by name, email, role, status, created date).
- Export functionality (CSV/Excel download).
- Advanced filters (date range, multiple roles, email verification status).
- User activity tracking and last login display.
