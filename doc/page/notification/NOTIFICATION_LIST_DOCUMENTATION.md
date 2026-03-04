# Notification List Screen Documentation

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
import { MdAdd, MdMarkEmailRead } from 'react-icons/md';
import { FiSearch, FiFilter, FiList, FiEye, FiTrash2 } from 'react-icons/fi';
import { useGetNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from '../../../tanstack/useNotifications';
import Pagination from '../../../components/ui/Pagination';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatDateTime, isNotificationUnread } from '../../../utils/notificationUtils';
import type { INotification } from '../../../types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetNotifications(params)` fetches paginated notification list with filters and search.
- **Mutations:** 
  - `useMarkNotificationAsRead()` handles marking individual notifications as read
  - `useMarkAllNotificationsAsRead()` handles marking all notifications as read
  - `useDeleteNotification()` handles notification deletion with cache invalidation
- **Local State:**
  - `searchTerm` - Current search input value
  - `debouncedSearch` - Debounced search value (500ms delay)
  - `filterCategory` - Selected category filter (all/general/appointment/payment)
  - `filterType` - Selected type filter (all/email/sms/in_app)
  - `filterStatus` - Selected status filter (all/read/unread/pending/sent/failed)
  - `currentPage` - Current page number (default: 1)
  - `itemsPerPage` - Items per page (default: 10)
- **Derived State:** `params` memo combines filters, search, and pagination for API call.

## UI Structure
- **Toolbar:** Search input, category filter dropdown, type filter dropdown, status filter dropdown, items per page selector, "Mark All Read" button, "Create Notification" button (admin only).
- **Notification Cards:** Card-based layout (no table) displaying notifications with subject, message, category badge, type badge, read status, timestamp, and action buttons. Cards are clickable to navigate to detail view.
- **Pagination:** Component at bottom showing current page, total pages, and navigation controls.
- **Delete Modal:** Confirmation modal (`ConfirmModal`) for delete actions instead of browser alert.

## Planned Layout
```
┌────────────────────────────────────────────────────────────┐
│ [Search] [Category] [Type] [Status] [Items/Page] [Mark All]│
│                                                      [+Add]│
├────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [Badge] Subject                    [Unread] [V] [D]  │ │
│ │ Message preview...                                   │ │
│ │ Type • Category • Created date                       │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [Badge] Subject                    [Read] [V] [D]    │ │
│ │ Message preview...                                   │ │
│ │ Type • Category • Created date                       │ │
│ └──────────────────────────────────────────────────────┘ │
│ ...                                                       │
├────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50        [Prev] [Next]      │
└────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔍 Search notifications...  [Category: All ▼] [Type: All ▼]        │
│ [Status: All ▼] [10 per page ▼] [Mark All Read]    [+ Create]      │
├──────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ [Appointment] Appointment Confirmed          🔵 [👁] [🗑]      │ │
│ │ Your appointment for Haircut is confirmed on Jan 15, 2025.       │ │
│ │ in_app • appointment • Jan 15, 2025 10:30 AM                    │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ [Payment] Payment Successful                    [👁] [🗑]      │ │
│ │ Your payment of $50.00 was successful.                          │ │
│ │ email • payment • Jan 14, 2025 2:15 PM                        │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ [General] System Maintenance                    [👁] [🗑]      │ │
│ │ System maintenance scheduled tonight from 10 PM to 12 AM.        │ │
│ │ sms • general • Jan 13, 2025 9:00 AM                          │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ ...                                                                 │
├──────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50              [← Prev] [Next →]     │
└──────────────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Text input with debounce (500ms) using `input-search` class.
- **Category Filter:** Select dropdown with options: All, General, Appointment, Payment.
- **Type Filter:** Select dropdown with options: All, Email, SMS, In-app.
- **Status Filter:** Select dropdown with options: All, Read, Unread, Pending, Sent, Failed.
- **Items Per Page:** Select dropdown with options: 10, 25, 50, 100.
- **Mark All Read Button:** Primary button to mark all notifications as read.
- **Create Notification Button:** Primary button linking to `/notifications/new` (admin only).

## API Integration
- **Endpoint:** `GET /api/notifications` with query parameters (page, limit, search, category, type, status).
- **Hook:** `useGetNotifications(params)` returns paginated notification data.
- **Response Structure:**
  ```typescript
  {
    notifications: INotification[],
    pagination: {
      currentPage: number,
      totalPages: number,
      totalNotifications: number,
      hasNextPage: boolean,
      hasPrevPage: boolean
    }
  }
  ```
- **Mark as Read Endpoint:** `PATCH /api/notifications/:notificationId/read` via `useMarkNotificationAsRead()` mutation.
- **Mark All as Read Endpoint:** `PATCH /api/notifications/read-all` via `useMarkAllNotificationsAsRead()` mutation.
- **Delete Endpoint:** `DELETE /api/notifications/:notificationId` via `useDeleteNotification()` mutation.

## Components Used
- React Router DOM: `Link` for navigation.
- React Icons: `MdVisibility`, `MdDelete`, `MdAdd`, `MdMarkEmailRead` for action buttons.
- TanStack Query: `useGetNotifications`, `useMarkNotificationAsRead`, `useMarkAllNotificationsAsRead`, `useDeleteNotification` hooks.
- Custom Components: `Pagination` component for pagination controls, `ConfirmModal` for delete confirmation.
- Utility Functions: `formatDateTime` from `@/utils/notificationUtils`.
- Tailwind CSS classes: `input-search`, `btn-primary`, `btn-secondary`, `btn-sm`, `btn-ghost`, `badge-soft`, `badge-success`, `badge-error`, `alert-error`.

## Error Handling
- **Loading State:** Display skeleton cards with `animate-pulse` effect.
- **Error State:** Show inline `alert-error` with API error message from `error.response?.data?.message`.
- **Empty State:** Display "No notifications found" message when `notifications.length === 0`.
- **Delete Error:** Show error message if deletion fails, keep notification in list.
- **Network Errors:** Gracefully handle network failures with user-friendly messages.

## Navigation Flow
- Route: `/notifications`.
- **Card Click:** Navigate to `/notifications/:id` (NotificationDetails page).
- **View Action:** Navigate to `/notifications/:id` (NotificationDetails page) using icon button with `MdVisibility` icon.
- **Delete Action:** Opens `ConfirmModal` for confirmation, then deletes notification and refreshes list. Uses `MdDelete` icon button.
- **Create Notification Button:** Navigate to `/notifications/new` (NotificationAdd page) with `MdAdd` icon (admin only).
- **Mark as Read:** Clicking unread indicator or using mark as read action updates notification status.

## Functions Involved
- **`formatDateTime`** — Formats ISO timestamps for display (from `@/utils/notificationUtils`).
  ```tsx
  import { formatDateTime } from '@/utils/notificationUtils';
  // Usage: formatDateTime(notification.createdAt)
  ```

- **`getCategoryBadgeClass`** — Returns badge class based on notification category (from `@/utils/notificationUtils`).
  ```tsx
  import { getCategoryBadgeClass } from '@/utils/notificationUtils';
  // Usage: getCategoryBadgeClass(notification.category)
  ```

- **`getTypeDisplayName`** — Gets display name for notification type (from `@/utils/notificationUtils`).
  ```tsx
  import { getTypeDisplayName } from '@/utils/notificationUtils';
  // Usage: getTypeDisplayName(notification.type)
  ```

- **`handleDeleteClick`** — Opens delete confirmation modal.
  ```tsx
  const handleDeleteClick = useCallback((notificationId: string, subject: string) => {
    setNotificationToDelete({ id: notificationId, subject });
    setDeleteModalOpen(true);
  }, []);
  ```

- **`handleDeleteConfirm`** — Confirms and executes notification deletion.
  ```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!notificationToDelete) return;
    try {
      await deleteNotification.mutateAsync(notificationToDelete.id);
      setDeleteModalOpen(false);
      setNotificationToDelete(null);
    } catch (deleteError) {
      // Error handled by mutation onError
    }
  }, [notificationToDelete, deleteNotification]);
  ```

- **`handleMarkAsRead`** — Marks a single notification as read.
  ```tsx
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      // Error handled by mutation onError
    }
  }, [markAsRead]);
  ```

- **`handleMarkAllAsRead`** — Marks all notifications as read.
  ```tsx
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      // Error handled by mutation onError
    }
  }, [markAllAsRead]);
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
- **Card Layout:** Uses card-based layout instead of table for better mobile responsiveness and visual hierarchy.
- **Unread Indicator:** Blue dot or badge to indicate unread notifications.
- **Category Badges:** Color-coded badges (general: gray, appointment: blue, payment: green).
- **Type Display:** Shows notification type (email, sms, in_app) with icon or text.
- **Read Status:** Visual indicator (badge or dot) showing read/unread status.
- **Delete Confirmation:** Uses `ConfirmModal` component instead of browser `window.confirm()` for better UX.
- **Icons:** Action buttons use Material Design icons (`MdVisibility`, `MdDelete`, `MdAdd`, `MdMarkEmailRead`) for visual clarity.
- **Utility Functions:** Reusable functions (`formatDateTime`, `getCategoryBadgeClass`, `getTypeDisplayName`) are imported from `@/utils/notificationUtils` for consistency across components.

## Future Enhancements
- Bulk actions (mark multiple as read, delete multiple).
- Notification grouping by date (Today, Yesterday, This Week, etc.).
- Real-time updates via Socket.io integration.
- Notification preferences management.
- Export functionality (CSV/Excel download).
- Advanced filters (date range, recipient filter for admin).
