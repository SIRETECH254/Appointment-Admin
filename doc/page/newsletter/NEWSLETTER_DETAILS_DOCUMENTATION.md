# Newsletter Details Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiMail, FiUser, FiCalendar, FiClock, FiAlertTriangle, FiXCircle, FiTag } from 'react-icons/fi';
import { useGetSubscriberById } from '@/tanstack/useNewsletters';
import StatusBadge from '@/components/ui/StatusBadge';
import type { INewsletter, IUser } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/newsletters/:id`).
- **TanStack Query:** `useGetSubscriberById(id)` fetches subscriber data for display.
- **Derived State:**
  - `userInfo` - Memoized user info from subscriber (handle both string ID and populated IUser object)

## UI Structure
- **Header Card:** Subscriber email, status badge, and action buttons (Edit Status, Back to Newsletters).
- **Subscriber Information Card:** Email, status, and source with icons.
- **Subscription Details Card:** Subscribed at and unsubscribed at (if applicable) with icons.
- **User Information Card:** Linked user information (if userId exists, show name and email) with icons.
- **System Information Card:** Created date and last updated date (if available) with icons.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Newsletter Details                        │
│ [Email Icon] email@example.com           │
│ [Status Badge]                            │
│ [Edit Status] [Back to Newsletters]       │
├────────────────────────────────────────────┤
│ Subscriber Information                    │
│ Email │ Status │ Source                   │
├────────────────────────────────────────────┤
│ Subscription Details                      │
│ Subscribed At │ Unsubscribed At          │
├────────────────────────────────────────────┤
│ User Information                          │
│ Linked User │ User Email                 │
├────────────────────────────────────────────┤
│ System Information                        │
│ Created │ Updated                        │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Newsletter Details                                 │
│ 📧 email@example.com                               │
│ [✓ SUBSCRIBED]                                     │
│ [Edit Status] [Back to Newsletters]                │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 📧 Subscriber Information                           │
│ ─────────────────────────────────────────────────  │
│ 📧 Email                                            │
│ email@example.com                                   │
│                                                    │
│ 🏷️ Status                                          │
│ ✓ SUBSCRIBED                                       │
│                                                    │
│ 🏷️ Source                                          │
│ WEBSITE                                            │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 📅 Subscription Details                            │
│ ─────────────────────────────────────────────────  │
│ 📅 Subscribed At                                    │
│ January 23, 2026, 10:00 AM                        │
│                                                    │
│ 📅 Unsubscribed At                                 │
│ —                                                  │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 👤 User Information                                 │
│ ─────────────────────────────────────────────────  │
│ 👤 Linked User                                      │
│ John Doe                                            │
│                                                    │
│ 📧 User Email                                       │
│ john@example.com                                    │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 🕐 System Information                              │
│ ─────────────────────────────────────────────────  │
│ 🕐 Created                                         │
│ January 23, 2026, 10:00 AM                         │
│                                                    │
│ 🕐 Last Updated                                    │
│ January 23, 2026, 10:00 AM                         │
└────────────────────────────────────────────────────┘
```

## API Integration
- **Endpoint:** `GET /api/newsletter/:subscriberId` via `useGetSubscriberById(subscriberId)`.
- **Response Structure:**
  ```typescript
  {
    success: true,
    data: {
      subscriber: INewsletter
    }
  }
  ```

## Components Used
- React Router DOM: `Link`, `useParams` for routing.
- React Icons: `FiMail`, `FiUser`, `FiCalendar`, `FiClock`, `FiAlertTriangle`, `FiXCircle`, `FiTag` for section icons.
- TanStack Query: `useGetSubscriberById` hook.
- Custom Components: `StatusBadge` for status display.
- Tailwind CSS classes: `btn-primary`, `btn-secondary`, `rounded-2xl`, `border`, `shadow-sm`, `p-6`, `alert-error`.

## Error Handling
- **Loading State:** Show loading skeleton while fetching subscriber data.
  - Header card skeleton with email icon placeholder
  - Multiple detail section skeletons
- **Error State:** Display centered error icon (`FiAlertTriangle`) with error message if fetch fails.
- **Not Found:** Display error icon (`FiXCircle`) if subscriber doesn't exist, with link back to newsletter list.

## Navigation Flow
- Route: `/newsletters/:id`.
- **Edit Status Button:** Navigate to `/newsletters/:id/edit` (NewsletterEdit page).
- **Back to Newsletters Button:** Navigate to `/newsletters` (newsletter list).

## Functions Involved
- **`formatDate`** — Formats ISO timestamps with time included for display.
- **`getUserInfo`** — Extracts user info from subscriber (handle both string ID and populated IUser object).

## Implementation Details
- **Loading Skeleton:** Matches BreakDetails pattern with header card skeleton and multiple detail section skeletons.
- **Error State:** Centered icon (`FiAlertTriangle`) when error occurs, with error message and back button.
- **Not Found State:** Centered icon (`FiXCircle`) when subscriber not found, with message and back button.
- **Section Icons:** Each section uses different colored icons for visual distinction:
  - Subscriber Information: `FiMail` (blue), `FiTag` (green, purple)
  - Subscription Details: `FiCalendar` (orange, red)
  - User Information: `FiUser` (teal), `FiMail` (blue)
  - System Information: `FiClock` (orange, teal)
- **Status Display:** Uses `StatusBadge` component with `contact-status` type for consistent status display.

## Future Enhancements
- Show subscription history (re-subscription tracking).
- Display unsubscribe token information.
- Show tags management interface.
- Display subscription source details.
- Activity log for subscriber changes.
- Clone subscriber functionality.
- Export subscriber data.
