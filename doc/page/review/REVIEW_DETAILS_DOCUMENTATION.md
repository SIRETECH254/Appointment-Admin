# Review Details Screen Documentation

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
import { FiUser, FiMail, FiClock, FiFileText, FiCalendar, FiAlertTriangle, FiXCircle, FiStar } from 'react-icons/fi';
import { useGetReviewById } from '@/tanstack/useReviews';
import { formatReviewDate, formatReviewDateTime, getUserName, getUserInitials, getStaffName, getServiceNames, getAppointmentDate } from '@/utils/reviewUtils';
import type { IReview, IUser } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/reviews/:id`).
- **TanStack Query:** `useGetReviewById(id)` fetches review data for display.
- **Derived State:**
  - `userName` - Memoized user name from review (handle both string ID and populated IUser object)
  - `userInitials` - Memoized user initials for avatar fallback
  - `user` - Memoized user object if populated
  - `staffName` - Memoized staff name from appointment
  - `serviceNames` - Memoized service names array from appointment
  - `appointmentDate` - Memoized formatted appointment date

## UI Structure
- **Header Card:** User avatar, user name, star rating display, status badge, and action buttons (Back to Reviews).
- **Review Information Card:** Rating (stars), comment, and status with icons.
- **User Information Card:** User name and email with icons.
- **Appointment Information Card:** Staff name, services, and appointment date with icons.
- **System Information Card:** Created date and last updated date (if available) with icons.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Review Details                              │
│ [Avatar] User Name                         │
│ ⭐⭐⭐⭐⭐ (5)                               │
│ [Status Badge]                              │
│ [Back to Reviews]                           │
├────────────────────────────────────────────┤
│ 📄 Review Information                       │
│ ⭐ Rating │ 💬 Comment │ 📊 Status        │
├────────────────────────────────────────────┤
│ 👤 User Information                         │
│ 👤 User Name │ 📧 User Email                │
├────────────────────────────────────────────┤
│ 📅 Appointment Information                  │
│ 👤 Staff │ 📄 Services │ 🕐 Appointment Date│
├────────────────────────────────────────────┤
│ 📅 System Information                       │
│ 📅 Created │ 📅 Last Updated                │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Review Details                                     │
│ [Avatar] John Doe                                  │
│ ⭐⭐⭐⭐⭐ (5)                                      │
│ [Approved Badge]                                   │
│ [Back to Reviews]                                  │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 📄 Review Information                              │
│ ─────────────────────────────────────────────────  │
│ ⭐ Rating                                           │
│ ⭐⭐⭐⭐⭐ (5)                                      │
│                                                    │
│ 💬 Comment                                          │
│ Great service! Very professional and friendly.    │
│                                                    │
│ 📊 Status                                          │
│ [Approved Badge]                                   │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 👤 User Information                                │
│ ─────────────────────────────────────────────────  │
│ 👤 User Name                                        │
│ John Doe                                            │
│                                                    │
│ 📧 User Email                                       │
│ john@example.com                                   │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 📅 Appointment Information                          │
│ ─────────────────────────────────────────────────  │
│ 👤 Staff                                            │
│ Jane Smith                                          │
│                                                    │
│ 📄 Services                                         │
│ Haircut, Styling                                    │
│                                                    │
│ 🕐 Appointment Date                                 │
│ Jan 23, 2026                                       │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 📅 System Information                               │
│ ─────────────────────────────────────────────────  │
│ 📅 Created                                          │
│ Jan 23, 2026, 10:00 AM                            │
│                                                    │
│ 📅 Last Updated                                     │
│ Jan 23, 2026, 10:00 AM                            │
└────────────────────────────────────────────────────┘
```

## API Integration
- **Endpoint:** `GET /api/reviews/:reviewId` via `useGetReviewById(reviewId)`.
- **Response Structure:**
  ```typescript
  {
    success: true,
    data: {
      review: IReview
    }
  }
  ```
- **Note:** The review includes populated user and appointment data. The appointment includes staff and services information.

## Components Used
- React Router DOM: `Link`, `useParams` for routing.
- React Icons: `FiUser`, `FiMail`, `FiClock`, `FiFileText`, `FiCalendar`, `FiStar`, `FiAlertTriangle`, `FiXCircle` for section icons and status indicators.
- TanStack Query: `useGetReviewById` hook.
- Custom Star Rating Component: `StarRating` component for displaying ratings (1-5 stars).
- Utility Functions: `formatReviewDate`, `formatReviewDateTime`, `getUserName`, `getUserInitials`, `getStaffName`, `getServiceNames`, `getAppointmentDate` from `@/utils/reviewUtils`.
- Tailwind CSS classes: `btn-primary`, `btn-secondary`, `rounded-2xl`, `border`, `shadow-sm`, `p-6`, `alert-error`, `badge-success`, `badge-soft`, `badge-error`, `animate-pulse`.

## Error Handling
- **Loading State:** Show loading skeleton with `animate-pulse` effect divided into sections:
  - Header section skeleton (avatar, name, rating)
  - Review Information section skeleton
  - User Information section skeleton
  - Appointment Information section skeleton
  - System Information section skeleton
- **Error State:** Display `alert-error` with API error message if fetch fails, with link back to review list.
- **Not Found:** Display error message if review doesn't exist, with link back to review list.

## Navigation Flow
- Route: `/reviews/:id`.
- **Back to Reviews Button:** Navigate to `/reviews` (review list).

## Functions Involved
- **`getUserName`** — Extracts user name from review (handle both string ID and populated IUser object).
- **`getUserInitials`** — Gets user initials for avatar fallback.
- **`getStaffName`** — Extracts staff name from review's appointment.
- **`getServiceNames`** — Extracts service names from review's appointment.
- **`getAppointmentDate`** — Extracts and formats appointment date from review's appointment.
- **`formatReviewDate`** — Formats ISO date strings for display (date only).
- **`formatReviewDateTime`** — Formats ISO date strings for display (date and time).
- **`StarRating`** — Component that displays rating as filled/empty stars (1-5).

## Implementation Details
- **Skeleton Loading:** Loading state is divided into separate sections matching the final layout structure. Each section uses `animate-pulse` class for smooth loading animation.
- **Section Icons:** Each information section has a distinct icon and color:
  - Review Information: `FiFileText` (teal)
  - User Information: `FiUser` (blue), `FiMail` (green)
  - Appointment Information: `FiUser` (blue), `FiFileText` (teal), `FiClock` (purple)
  - System Information: `FiCalendar` (orange/teal)
- **Star Rating Display:** Custom `StarRating` component using `FiStar` icons with filled/empty states. Filled stars use `text-yellow-400 fill-current`, empty stars use `text-gray-300`.
- **Status Badges:** Uses `badge-success` (Approved), `badge-soft` (Pending), `badge-error` (Rejected) classes.
- **Avatar Display:** Shows user avatar image if available, otherwise displays initials in a colored circle.
- **Responsive Design:** Cards stack vertically on mobile, maintain side-by-side layout on desktop.
- **Error States:** Error and not found states include helpful icons (`FiAlertTriangle`, `FiXCircle`) and navigation links back to review list.

## Future Enhancements
- Edit review functionality (update rating and comment).
- Reply to review functionality.
- Show related reviews (same staff, same service).
- Review helpfulness voting.
- Review analytics (average rating trends, review distribution).
- Export review as PDF.
- Print review functionality.
