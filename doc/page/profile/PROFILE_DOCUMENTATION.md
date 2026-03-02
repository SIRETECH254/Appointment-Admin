# Profile Screen Documentation

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
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';
```

## Context and State Management
- **Auth context:** `useAuth()` supplies cached `user` for immediate UI fallback.
- **TanStack Query:** `useGetProfile()` fetches the latest profile payload.
- **Derived state:** initials, role label, and formatted timestamps are memoized from user data.

## UI Structure
- **Header block:** avatar (image or initials), name, email, role pill, status.
- **Details card:** phone, email, created and updated timestamps.
- **Primary CTAs:** `Edit Profile` and `Change Password` buttons.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Avatar + Name + Role/Status                │
│ Email                                      │
├────────────────────────────────────────────┤
│ Phone / Email / Created / Updated          │
├────────────────────────────────────────────┤
│ [Edit Profile]  [Change Password]          │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ (Avatar)  Jane Doe          [Admin] [Active]       │
│          jane@company.com                          │
│                                                    │
│ Phone: +254700000000     Created: Jan 01, 2025     │
│ Updated: Feb 01, 2026                              │
│                                                    │
│ [Edit Profile]  [Change Password]                  │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **CTA links** (navigate to edit/change password):
  ```tsx
  <Link to="/profile/edit" className="btn-primary btn-text-primary">
    Edit Profile
  </Link>
  ```

## API Integration
- **Endpoint:** `GET /api/users/profile`.
- **Hook:** `useGetProfile()` returns `data` for the profile view.
- **Fallback:** if query is loading, `useAuth().user` is used as a temporary source.

## Components Used
- React + React Router DOM: `Link`.
- Tailwind CSS utility classes: `btn-primary`, `badge-soft`, `badge-success`.

## Error Handling
- If the query fails, display the API message from `error.response?.data?.message`.
- Keep the fallback user data visible even if network request fails.

## Navigation Flow
- Route: `/profile`.
- `Edit Profile` ➞ `/profile/edit`.
- `Change Password` ➞ `/profile/change-password`.

## Functions Involved
- **`formatDateTime`** — normalizes timestamps for display.
  ```tsx
  const formatDateTime = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };
  ```

## Future Enhancements
- Add a dedicated profile activity panel.
- Show multiple roles with a pill list.
- Display last login and last password change metadata.

