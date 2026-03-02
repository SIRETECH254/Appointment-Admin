# Role List Screen Documentation

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
import { useGetAllRoles, useDeleteRole } from '@/tanstack/useRoles';
import Pagination from '@/components/ui/Pagination';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatDateTime, getRoleInitials, formatPermissions } from '@/utils/roleUtils';
import type { IRole } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetAllRoles(params)` fetches paginated role list with filters and search.
- **Delete Mutation:** `useDeleteRole()` handles role deletion with cache invalidation.
- **Local State:**
  - `searchTerm` - Current search input value
  - `debouncedSearch` - Debounced search value (500ms delay)
  - `filterStatus` - Selected status filter (all/active/inactive)
  - `currentPage` - Current page number (default: 1)
  - `itemsPerPage` - Items per page (default: 10)
- **Derived State:** `params` memo combines filters, search, and pagination for API call.

## UI Structure
- **Toolbar:** Search input, status filter dropdown, items per page selector, "Add Role" button.
- **Table:** HTML `<table>` element with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags. Header row with columns (Name, Display Name, Permissions, Status, System Role, Created, Actions), data rows, loading skeleton rows, error/empty states. Horizontal scroll enabled when content overflows.
- **Pagination:** Component at bottom showing current page, total pages, and navigation controls.
- **Delete Modal:** Confirmation modal (`ConfirmModal`) for delete actions instead of browser alert.

## Planned Layout
```
┌────────────────────────────────────────────────────────────┐
│ [Search] [Status Filter] [Items/Page] [+Add]              │
├────────────────────────────────────────────────────────────┤
│ Name │ Display Name │ Permissions │ Status │ System │ Created │ Actions │
├────────────────────────────────────────────────────────────┤
│ admin│ Admin        │ *           │ Active │ Yes    │ Date    │ [V][E]  │
│ ...                                                         │
├────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50        [Prev] [Next]      │
└────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔍 Search roles...  [Status: All ▼] [10 per page ▼]                │
│                                                          [+ Add Role] │
├──────────────────────────────────────────────────────────────────────┤
│ Name │ Display Name │ Permissions │ Status │ System │ Created │ Actions │
├──────────────────────────────────────────────────────────────────────┤
│ admin│ Admin        │ *           │ Active │ Yes    │ Jan 01,25│ 👁 ✏ 🗑 │
│ staff│ Staff        │ 3 perms     │ Active │ Yes    │ Jan 02,25│ 👁 ✏    │
│ custom│ Custom Role │ 5 perms     │ Inact. │ No     │ Jan 03,25│ 👁 ✏ 🗑 │
│ ...                                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50              [← Prev] [Next →]     │
└──────────────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Text input with debounce (500ms) using `input-search` class.
- **Status Filter:** Select dropdown with options: All, Active, Inactive.
- **Items Per Page:** Select dropdown with options: 10, 25, 50, 100.
- **Add Role Button:** Primary button linking to `/roles/new`.

## API Integration
- **Endpoint:** `GET /api/roles` with query parameters (page, limit, search, isActive).
- **Hook:** `useGetAllRoles(params)` returns paginated role data.
- **Response Structure:**
  ```typescript
  {
    success: true,
    data: {
      roles: IRole[]
    }
  }
  ```
- **Delete Endpoint:** `DELETE /api/roles/:roleId` via `useDeleteRole()` mutation.
- **Query Parameters:**
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 10)
  - `search` - Search term for name/displayName/description
  - `isActive` - Filter by active status ("true" or "false" as string)

## Components Used
- React Router DOM: `Link` for navigation.
- React Icons: `MdVisibility`, `MdEdit`, `MdDelete`, `MdAdd` for action buttons.
- TanStack Query: `useGetAllRoles`, `useDeleteRole` hooks.
- Custom Components: `Pagination` component for pagination controls, `ConfirmModal` for delete confirmation.
- Utility Functions: `formatDateTime`, `getRoleInitials`, `formatPermissions` from `@/utils/roleUtils`.
- Tailwind CSS classes: `input-search`, `btn-primary`, `btn-secondary`, `btn-sm`, `btn-ghost`, `badge-soft`, `badge-success`, `badge-error`, `alert-error`.

## Error Handling
- **Loading State:** Display 5 skeleton rows with `animate-pulse` effect in table body.
- **Error State:** Show inline `alert-error` with API error message from `error.response?.data?.message`.
- **Empty State:** Display "No roles found" message when `roles.length === 0`.
- **Delete Error:** Show error message if deletion fails, keep role in list.
- **System Role Protection:** Disable delete button for system roles (`isSystemRole === true`).
- **Network Errors:** Gracefully handle network failures with user-friendly messages.

## Navigation Flow
- Route: `/roles`.
- **View Action:** Navigate to `/roles/:id` (RoleDetails page) using icon button with `MdVisibility` icon.
- **Edit Action:** Navigate to `/roles/:id/edit` (RoleEdit page) using icon button with `MdEdit` icon.
- **Delete Action:** Opens `ConfirmModal` for confirmation, then deletes role and refreshes list. Uses `MdDelete` icon button. Disabled for system roles.
- **Add Role Button:** Navigate to `/roles/new` (RoleAdd page) with `MdAdd` icon.

## Functions Involved
- **`formatDateTime`** — Formats ISO timestamps for display (from `@/utils/roleUtils`).
  ```tsx
  import { formatDateTime } from '@/utils/roleUtils';
  // Usage: formatDateTime(role.createdAt)
  ```

- **`getRoleInitials`** — Extracts initials from role name/displayName for avatar fallback (from `@/utils/roleUtils`).
  ```tsx
  import { getRoleInitials } from '@/utils/roleUtils';
  // Usage: getRoleInitials(role)
  ```

- **`formatPermissions`** — Formats permissions array for display (from `@/utils/roleUtils`).
  ```tsx
  import { formatPermissions } from '@/utils/roleUtils';
  // Usage: formatPermissions(role.permissions)
  // Returns: "*" if all permissions, or comma-separated list, or count if many
  ```

- **`handleDeleteClick`** — Opens delete confirmation modal.
  ```tsx
  const handleDeleteClick = useCallback((roleId: string, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
    setDeleteModalOpen(true);
  }, []);
  ```

- **`handleDeleteConfirm`** — Confirms and executes role deletion.
  ```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole.mutateAsync(roleToDelete.id);
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (deleteError) {
      // Error handled by mutation onError
    }
  }, [roleToDelete, deleteRole]);
  ```

- **`debounceSearch`** — Debounces search input to reduce API calls.
  ```tsx
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      // Reset to page 1 when search changes
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  ```

## Implementation Details
- **Table Structure:** Uses semantic HTML `<table>` elements with proper `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags for accessibility.
- **Horizontal Scroll:** Table container has `overflow-x-auto` class with `min-w-[800px]` on table to enable horizontal scrolling when content overflows on smaller screens.
- **Delete Confirmation:** Uses `ConfirmModal` component instead of browser `window.confirm()` for better UX. Modal includes backdrop click and Escape key support.
- **System Role Protection:** Delete button is disabled for system roles (`isSystemRole === true`) to prevent accidental deletion of critical roles.
- **Permissions Display:** Shows "*" for admin role (all permissions), comma-separated list for small arrays, or count badge for many permissions.
- **Icons:** Action buttons use Material Design icons (`MdVisibility`, `MdEdit`, `MdDelete`) for visual clarity.
- **Utility Functions:** Reusable functions (`formatDateTime`, `getRoleInitials`, `formatPermissions`) are imported from `@/utils/roleUtils` for consistency across components.

## Future Enhancements
- Bulk actions (activate/deactivate multiple roles).
- Column sorting (by name, display name, permissions count, status, created date).
- Export functionality (CSV/Excel download).
- Advanced filters (date range, system role filter, permissions search).
- Role usage tracking (show how many users have each role assigned).
- Permission management interface (visual permission editor).
