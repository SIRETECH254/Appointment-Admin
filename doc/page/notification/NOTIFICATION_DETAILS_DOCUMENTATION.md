# Notification Details Screen Documentation

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
import { useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdDelete, MdMarkEmailRead } from 'react-icons/md';
import { useGetNotification, useMarkNotificationAsRead, useDeleteNotification } from '@/tanstack/useNotifications';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatDateTimeWithTime, getCategoryBadgeClass, getTypeDisplayName } from '@/utils/notificationUtils';
import type { INotification } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/notifications/:id`).
- **TanStack Query:** `useGetNotification(id)` fetches notification data.
- **Mutations:**
  - `useMarkNotificationAsRead()` handles marking notification as read
  - `useDeleteNotification()` handles notification deletion with cache invalidation
- **Local State:**
  - `deleteModalOpen` - Delete confirmation modal state
  - `isMarkingAsRead` - Loading state for mark as read action

## UI Structure
- **Header Card:** Notification subject, category badge, type badge, read status, and action buttons (Mark as Read, Delete, Back).
- **Details Card:** Full notification message, metadata, context information, timestamps, and action buttons (if available).
- **Actions Card:** Bidirectional notification actions (if available) with buttons for API calls, navigation, modals, or confirmations.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ [Back] Notification Subject                 │
│ [Badge] [Badge] [Unread] [Mark Read] [Del] │
├────────────────────────────────────────────┤
│ Notification Details                       │
│                                            │
│ Full message content...                    │
│                                            │
│ Metadata: { ... }                          │
│ Context: { ... }                           │
│                                            │
│ Created: Date/Time                         │
│ Sent: Date/Time                            │
│ Read: Date/Time (if read)                  │
├────────────────────────────────────────────┤
│ Actions (if available)                     │
│ [Action Button 1] [Action Button 2]       │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ ← Back  Appointment Confirmed                      │
│ [Appointment] [in_app] [Unread] [Mark Read] [🗑]  │
│                                                    │
│ Your appointment for Haircut is confirmed on       │
│ January 15, 2025 at 10:30 AM.                     │
│                                                    │
│ Metadata:                                         │
│   appointmentId: "abc123"                          │
│                                                    │
│ Context:                                          │
│   resourceId: "abc123"                             │
│   resourceType: "appointment"                      │
│                                                    │
│ Created: Jan 15, 2025 10:30 AM                    │
│ Sent: Jan 15, 2025 10:30 AM                       │
│ Read: —                                           │
│                                                    │
│ Actions:                                          │
│ [Reschedule] [Cancel Appointment]                │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Back Button:** Navigate back to notification list.
- **Mark as Read Button:** Marks notification as read (only shown for unread notifications).
- **Delete Button:** Opens delete confirmation modal.
- **Action Buttons:** Dynamic buttons based on notification actions (if available).

## API Integration
- **Get Endpoint:** `GET /api/notifications/:notificationId` via `useGetNotification(notificationId)`.
- **Mark as Read Endpoint:** `PATCH /api/notifications/:notificationId/read` via `useMarkNotificationAsRead()` mutation.
- **Delete Endpoint:** `DELETE /api/notifications/:notificationId` via `useDeleteNotification()` mutation.
- **Response:** Notification object with all fields including metadata, context, and actions.

## Components Used
- React Router DOM: `Link`, `useNavigate`, `useParams` for routing.
- React Icons: `MdArrowBack`, `MdDelete`, `MdMarkEmailRead` for action buttons.
- TanStack Query: `useGetNotification`, `useMarkNotificationAsRead`, `useDeleteNotification` hooks.
- Custom Components: `ConfirmModal` for delete confirmation.
- Tailwind CSS classes: `label`, `btn-primary`, `btn-secondary`, `btn-danger`, `alert-success`, `alert-error`, `badge-soft`, `badge-success`, `badge-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching notification data.
- **Error State:** Display `alert-error` with API error message if fetch, mark as read, or delete fails.
- **No Notification Found:** Display error message and back button if notification doesn't exist.
- **Action Error:** Show error message if action button execution fails.

## Navigation Flow
- Route: `/notifications/:id`.
- **Back Button:** Navigate back to `/notifications` (notification list).
- **Delete Success:** After successful deletion, navigate to `/notifications` (notification list).
- **Action Navigation:** If action type is 'navigate', navigate to specified route.
- **Action Modal:** If action type is 'modal', open specified modal.
- **Action API:** If action type is 'api', make API call to specified endpoint.

## Functions Involved
- **`handleMarkAsRead`** — Marks notification as read.
  ```tsx
  const handleMarkAsRead = useCallback(async () => {
    if (!notification || notification.readAt) return;
    try {
      await markAsRead.mutateAsync(notification._id);
    } catch (error) {
      // Error handled by mutation onError
    }
  }, [notification, markAsRead]);
  ```

- **`handleDeleteClick`** — Opens delete confirmation modal.
  ```tsx
  const handleDeleteClick = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);
  ```

- **`handleDeleteConfirm`** — Confirms and executes notification deletion.
  ```tsx
  const handleDeleteConfirm = useCallback(async () => {
    if (!notification) return;
    try {
      await deleteNotification.mutateAsync(notification._id);
      navigate('/notifications');
    } catch (error) {
      // Error handled by mutation onError
    }
  }, [notification, deleteNotification, navigate]);
  ```

- **`handleActionClick`** — Handles action button clicks based on action type.
  ```tsx
  const handleActionClick = useCallback(async (action: INotificationAction) => {
    if (action.type === 'navigate' && action.route) {
      navigate(action.route);
    } else if (action.type === 'api' && action.endpoint) {
      // Make API call
      try {
        await api.request({
          method: action.method || 'POST',
          url: action.endpoint,
          data: action.payload,
        });
      } catch (error) {
        // Handle error
      }
    } else if (action.type === 'modal' && action.modal) {
      // Open modal
    } else if (action.type === 'confirm' && action.requiresConfirmation) {
      // Show confirmation dialog
    }
  }, [navigate]);
  ```

- **`formatDateTimeWithTime`** — Formats ISO timestamps with time for display (from `@/utils/notificationUtils`).
  ```tsx
  import { formatDateTimeWithTime } from '@/utils/notificationUtils';
  // Usage: formatDateTimeWithTime(notification.createdAt)
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

## Implementation Details
- **Read Status Indicator:** Visual badge or dot showing read/unread status.
- **Category Badge:** Color-coded badge based on category (general: gray, appointment: blue, payment: green).
- **Type Badge:** Shows notification type (email, sms, in_app).
- **Action Buttons:** Dynamic rendering based on notification actions array with proper handling for each action type.
- **Metadata Display:** Shows metadata object in formatted JSON or key-value pairs.
- **Context Display:** Shows context information including resourceId, resourceType, and additionalData.
- **Timestamp Display:** Shows created, sent, and read timestamps with proper formatting.
- **Delete Confirmation:** Uses `ConfirmModal` component for delete confirmation.

## Future Enhancements
- Rich text message rendering (if message contains HTML/markdown).
- Attachment display (if notifications support attachments).
- Reply functionality (if applicable).
- Share notification functionality.
- Print notification option.
