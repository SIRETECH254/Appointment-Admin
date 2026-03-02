# User Details Screen Documentation

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
import { FiUser, FiMail, FiPhone, FiShield, FiCheckCircle, FiXCircle, FiCalendar, FiClock } from 'react-icons/fi';
import { useGetUserById } from '@/tanstack/useUsers';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateTimeWithTime, getUserInitials, getRoleDisplayName } from '@/utils/userUtils';
import type { IUser } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/users/:id`).
- **TanStack Query:** `useGetUserById(id)` fetches user data for display.
- **Derived State:**
  - `initials` - Memoized user initials for avatar fallback
  - `hasStaffRole` - Memoized check if user has staff role (for showing working hours)

## UI Structure
- **Header Card:** User avatar (or initials), name, email, all role badges, status badge, and action buttons (Edit, Back to Users).
- **Contact Information Card:** Email and phone with icons.
- **Account Information Card:** All roles, account status, email verification status (StatusBadge), phone verification status (StatusBadge).
- **Working Hours Card:** Displayed only if user has staff role, shows weekly schedule with time slots for each day.
- **System Information Card:** Account creation date and last updated timestamp.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ User Header                               │
│ [Avatar] Name + Email                     │
│ [All Role Badges] [Status Badge]         │
│ [Edit User] [Back to Users]              │
├────────────────────────────────────────────┤
│ Contact Information                       │
│ Email │ Phone                             │
├────────────────────────────────────────────┤
│ Account Information                       │
│ Roles │ Status │ Email Verified │ Phone  │
├────────────────────────────────────────────┤
│ Working Hours (if staff role)            │
│ Monday - Sunday with time slots           │
├────────────────────────────────────────────┤
│ System Information                        │
│ Created │ Updated                         │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ User Details                                        │
│ [JD] John Doe                                       │
│ john@example.com                                    │
│ [Admin Badge] [Staff Badge] [Active Badge]        │
│ [Edit User] [Back to Users]                         │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 📧 Contact Information                              │
│ ─────────────────────────────────────────────────  │
│ 📧 Email                                            │
│ john@example.com                                    │
│                                                    │
│ 📞 Phone                                            │
│ +254712345678                                      │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 🛡️ Account Information                               │
│ ─────────────────────────────────────────────────  │
│ 🛡️ Role                                             │
│ [Admin Badge] [Staff Badge]                        │
│                                                    │
│ ✓ Status                                            │
│ [Active Badge]                                      │
│                                                    │
│ 📧 Email Verified                                   │
│ [Verified Badge] or [Not Verified Badge]           │
│                                                    │
│ 📞 Phone Verified                                   │
│ [Verified Badge] or [Not Verified Badge]          │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 🕐 Working Hours (if staff role)                    │
│ ─────────────────────────────────────────────────  │
│ Monday        09:00 - 17:00                        │
│ Tuesday       09:00 - 17:00                        │
│ Wednesday     09:00 - 17:00                        │
│ Thursday      09:00 - 17:00                        │
│ Friday        07:00 - 17:00                        │
│ Saturday      Not available                        │
│ Sunday        Not available                        │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ 📅 System Information                               │
│ ─────────────────────────────────────────────────  │
│ 📅 Account Created                                   │
│ Jan 22, 2025, 2:08 PM                               │
│                                                    │
│ 🕐 Last Updated                                     │
│ Feb 08, 2025, 4:10 PM                               │
└────────────────────────────────────────────────────┘
```

## API Integration
- **Get Endpoint:** `GET /api/users/:userId` via `useGetUserById(userId)`.
- **Response Structure:**
  ```typescript
  {
    user: IUser
  }
  ```
- **IUser Interface:**
  ```typescript
  {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
    roles: IRole[];
    isActive: boolean;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    workingHours?: IWorkingHours;
    createdAt: string;
    updatedAt: string;
  }
  ```

## Components Used
- React Router DOM: `Link`, `useParams` for routing.
- React Icons: `FiUser`, `FiMail`, `FiPhone`, `FiShield`, `FiCheckCircle`, `FiXCircle`, `FiCalendar`, `FiClock` for section icons.
- TanStack Query: `useGetUserById` hook.
- StatusBadge: For roles, status, and verification statuses.
- Utility Functions: `formatDateTimeWithTime`, `getUserInitials`, `getRoleDisplayName` from `@/utils/userUtils`.
- Tailwind CSS classes: `btn-primary`, `btn-secondary`, `rounded-2xl`, `border`, `shadow-sm`, `p-6`.

## Error Handling
- **Loading State:** Enhanced skeleton with multiple section placeholders matching the actual layout.
- **Error State:** Display error message with icon and link back to user list.
- **Not Found:** Display "User Not Found" message with link back to user list.

## Navigation Flow
- Route: `/users/:id`.
- **Edit Button:** Navigate to `/users/:id/edit` (UserEdit page).
- **Back to Users Button:** Navigate to `/users` (user list).

## Functions Involved
- **`getUserInitials`** — Extracts initials from user name for avatar fallback (from `@/utils/userUtils`).
  ```tsx
  import { getUserInitials } from '@/utils/userUtils';
  // Usage: getUserInitials(user)
  // Returns: "JD" for "John Doe", etc.
  ```

- **`getRoleDisplayName`** — Gets display name for user's primary role (from `@/utils/userUtils`).
  ```tsx
  import { getRoleDisplayName } from '@/utils/userUtils';
  // Usage: getRoleDisplayName(user)
  ```

- **`formatDateTimeWithTime`** — Formats ISO timestamps with time included (from `@/utils/userUtils`).
  ```tsx
  import { formatDateTimeWithTime } from '@/utils/userUtils';
  // Usage: formatDateTimeWithTime(user.createdAt)
  ```

- **`hasStaffRole`** — Checks if user has staff role (memoized).
  ```tsx
  const hasStaffRole = useMemo(() => {
    if (!user?.roles) return false;
    return user.roles.some((role) => role.name === 'staff' || role.name === 'Staff');
  }, [user]);
  ```

## Implementation Details
- **Header Card:** Displays user avatar (or initials badge), name, email, all role badges, and status badge.
- **Role Display:** Shows all roles assigned to the user as badges in the header.
- **Status Badges:** Uses StatusBadge component for roles, account status, and verification statuses.
- **Working Hours:** Only displayed if user has staff role, shows weekly schedule with time slots.
- **Section Icons:** Each section has an icon in its title for visual hierarchy.
- **Card Layout:** Each major section is a separate card with rounded corners, border, and shadow.

## Future Enhancements
- User activity log display (last login, actions taken).
- Related appointments and payments summary.
- Permission breakdown visualization.
- User notes/annotations functionality.
- Avatar upload functionality.
- Email/phone verification actions.
