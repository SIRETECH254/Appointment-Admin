# Contact Details Screen Documentation

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
import { useCallback, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdReply } from 'react-icons/md';
import { useGetContactMessageById, useUpdateContactStatus } from '@/tanstack/useContact';
import { formatDateTimeWithTime, getStatusBadgeClass, getStatusDisplayName } from '@/utils/contactUtils';
import type { IContact, ContactStatus } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/contact/:id`).
- **TanStack Query:** `useGetContactMessageById(id)` fetches contact data.
- **Update Status Mutation:** `useUpdateContactStatus()` handles contact status updates with cache invalidation.
- **Local State:**
  - `statusModalOpen` - Status update modal state (if using modal)
  - `selectedStatus` - Selected status for update (if using dropdown)

## UI Structure
- **Header Card:** Contact subject, status badge, and action buttons (Back, Reply, Status Update).
- **Details Card:** Full contact information including name, email, phone, subject, message, status, timestamps (created, updated), and user information (if userId exists).
- **Status Update Section:** Dropdown or button group to update contact status (NEW, READ, REPLIED, ARCHIVED).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ [Back] Contact Subject                     │
│ [Status Badge] [Reply] [Update Status]    │
├────────────────────────────────────────────┤
│ Contact Details                            │
│                                            │
│ From: Name <email@example.com>            │
│ Phone: +1234567890 (optional)             │
│ Subject: Contact subject                   │
│                                            │
│ Message:                                  │
│ Full message content...                    │
│                                            │
│ Status: [Status Badge]                     │
│ Created: Date/Time                        │
│ Updated: Date/Time                        │
│                                            │
│ User: [User info if userId exists]        │
├────────────────────────────────────────────┤
│ Status Update                              │
│ [New] [Read] [Replied] [Archived]         │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ ← Back  Booking Enquiry                           │
│ [NEW] [✉ Reply] [Update Status ▼]                │
│                                                    │
│ From: John Doe <john@example.com>                │
│ Phone: +254712345678                              │
│ Subject: Booking Enquiry                          │
│                                                    │
│ Message:                                         │
│ I would like to know your availability next week.  │
│ I'm interested in scheduling an appointment for    │
│ a haircut.                                        │
│                                                    │
│ Status: [NEW]                                     │
│ Created: Jan 15, 2025 10:30 AM                    │
│ Updated: Jan 15, 2025 10:30 AM                   │
│                                                    │
│ User: John Doe (john@example.com)                 │
│                                                    │
│ Update Status:                                    │
│ [New] [Read] [Replied] [Archived]                │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Back Button:** Navigate back to contact list.
- **Reply Button:** Navigate to reply page (`/contact/:id/reply`).
- **Status Update:** Dropdown or button group to change status (NEW, READ, REPLIED, ARCHIVED).

## API Integration
- **Get Endpoint:** `GET /api/contact/:contactId` via `useGetContactMessageById(contactId)`.
- **Update Status Endpoint:** `PATCH /api/contact/:contactId/status` via `useUpdateContactStatus()` mutation.
- **Request Payload:**
  ```typescript
  {
    status: "NEW" | "READ" | "REPLIED" | "ARCHIVED"
  }
  ```
- **Response:** Contact object with all fields including userId (if exists).

## Components Used
- React Router DOM: `Link`, `useNavigate`, `useParams` for routing.
- React Icons: `MdArrowBack`, `MdReply` for action buttons.
- TanStack Query: `useGetContactMessageById`, `useUpdateContactStatus` hooks.
- Tailwind CSS classes: `label`, `btn-primary`, `btn-secondary`, `btn-ghost`, `alert-success`, `alert-error`, `badge-soft`, `badge-success`, `badge-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching contact data.
- **Error State:** Display `alert-error` with API error message if fetch or status update fails.
- **No Contact Found:** Display error message and back button if contact doesn't exist.
- **Status Update Error:** Show error message if status update fails, keep current status.

## Navigation Flow
- Route: `/contact/:id`.
- **Back Button:** Navigate back to `/contact` (contact list).
- **Reply Button:** Navigate to `/contact/:id/reply` (ContactReply page).
- **Status Update Success:** Refresh contact data and show success message.

## Functions Involved
- **`handleStatusUpdate`** — Updates contact status.
  ```tsx
  const handleStatusUpdate = useCallback(async (newStatus: ContactStatus) => {
    if (!contact) return;
    try {
      await updateStatus.mutateAsync({
        contactId: contact._id,
        statusData: { status: newStatus }
      });
    } catch (error) {
      // Error handled by mutation onError
    }
  }, [contact, updateStatus]);
  ```

- **`formatDateTimeWithTime`** — Formats ISO timestamps with time for display (from `@/utils/contactUtils`).
  ```tsx
  import { formatDateTimeWithTime } from '@/utils/contactUtils';
  // Usage: formatDateTimeWithTime(contact.createdAt)
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

## Implementation Details
- **Status Badge:** Color-coded badge based on status (new: blue, read: gray, replied: green, archived: muted).
- **User Information:** If contact has `userId`, display user information (name, email) with link to user details.
- **Status Update UI:** Dropdown or button group allowing status change to READ, REPLIED, or ARCHIVED (cannot set back to NEW).
- **Message Display:** Full message text with proper whitespace handling (whitespace-pre-wrap).
- **Phone Display:** Show phone number if available, otherwise show "—" or omit field.

## Future Enhancements
- Reply history display (if backend supports multiple replies).
- Contact notes/annotations functionality.
- Email thread view (if contact has multiple related messages).
- Print contact details option.
- Share contact information functionality.
