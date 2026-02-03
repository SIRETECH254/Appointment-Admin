# Role Details Screen Documentation

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
import { useGetRoleById } from '@/tanstack/useRoles';
import { formatDateTimeWithTime, getRoleInitials, formatPermissions } from '@/utils/roleUtils';
import type { IRole } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/roles/:id`).
- **TanStack Query:** `useGetRoleById(id)` fetches role data for display.
- **Derived State:** 
  - `initials` - Memoized role initials for avatar fallback
  - `permissionsDisplay` - Formatted permissions string or array for display

## UI Structure
- **Header Card:** Role name/displayName with status badges (Active/Inactive, System Role indicator).
- **Details Card:** Two-column grid showing role information: name (read-only if system role), displayName, description, permissions list, isActive status, system role indicator, created/updated dates.
- **Permissions Display:** List of permissions as badges or formatted text.
- **Actions:** Edit button linking to `/roles/:id/edit`, Back to list button.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Role Header                               │
│ [Avatar] Role Name                        │
│ [Status Badge] [System Role Badge]       │
│ [Edit Role] [Back to Roles]              │
├────────────────────────────────────────────┤
│ Role Details                              │
│ Name │ Display Name                       │
│ Description                               │
│ Permissions │ Status                      │
│ System Role │ Created                     │
│ Updated                                    │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Role Details                                      │
│                                                    │
│ [AD] Admin                                        │
│ admin@example.com                                 │
│ [Active] [System Role]                            │
│                                                    │
│ [Edit Role]              [Back to Roles]          │
│                                                    │
│ ────────────────────────────────────────────────  │
│                                                    │
│ Role Details                                      │
│                                                    │
│ Name: admin                                       │
│ Display Name: Admin                               │
│ Description: Full system access for administrators│
│ Permissions: * (all permissions)                 │
│ Status: Active                                    │
│ System Role: Yes                                  │
│ Created: Jan 01, 2025, 10:30 AM                   │
│ Updated: Jan 15, 2025, 2:45 PM                    │
└────────────────────────────────────────────────────┘
```

## API Integration
- **Endpoint:** `GET /api/roles/:roleId` via `useGetRoleById(roleId)`.
- **Response Structure:**
  ```typescript
  {
    success: true,
    data: {
      role: IRole
    }
  }
  ```
- **IRole Interface:**
  ```typescript
  {
    _id: string;
    name: string;
    displayName: string;
    description?: string;
    permissions: string[];
    isActive: boolean;
    isSystemRole: boolean;
    createdAt: string;
    updatedAt: string;
  }
  ```

## Components Used
- React Router DOM: `Link`, `useParams` for routing.
- TanStack Query: `useGetRoleById` hook.
- Utility Functions: `formatDateTimeWithTime`, `getRoleInitials`, `formatPermissions` from `@/utils/roleUtils`.
- Tailwind CSS classes: `btn-primary`, `btn-secondary`, `badge`, `badge-soft`, `badge-success`, `badge-error`, `alert-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching role data.
- **Error State:** Display `alert-error` with API error message if fetch fails.
- **Not Found:** Display error message if role doesn't exist, with link back to role list.

## Navigation Flow
- Route: `/roles/:id`.
- **Edit Button:** Navigate to `/roles/:id/edit` (RoleEdit page).
- **Back to Roles Button:** Navigate to `/roles` (role list).

## Functions Involved
- **`getRoleInitials`** — Extracts initials from role name/displayName for avatar fallback (from `@/utils/roleUtils`).
  ```tsx
  import { getRoleInitials } from '@/utils/roleUtils';
  // Usage: getRoleInitials(role)
  // Returns: "AD" for "Admin", "ST" for "Staff", etc.
  ```

- **`formatPermissions`** — Formats permissions array for display (from `@/utils/roleUtils`).
  ```tsx
  import { formatPermissions } from '@/utils/roleUtils';
  // Usage: formatPermissions(role.permissions)
  // Returns: "*" if all permissions, or formatted list
  ```

- **`formatDateTimeWithTime`** — Formats ISO timestamps with time included (from `@/utils/roleUtils`).
  ```tsx
  import { formatDateTimeWithTime } from '@/utils/roleUtils';
  // Usage: formatDateTimeWithTime(role.createdAt)
  // Returns: "Jan 01, 2025, 10:30 AM"
  ```

## Implementation Details
- **Header Card:** Displays role name/displayName prominently with avatar fallback using initials.
- **Status Badges:** Shows Active/Inactive status and System Role indicator as badges.
- **Permissions Display:** 
  - If permissions array contains "*", display as "All Permissions" or "*"
  - Otherwise, display as comma-separated list or badges
  - Handle empty permissions array gracefully
- **System Role Indicator:** Clearly show if role is a system role (cannot be deleted).
- **Read-only Fields:** Name field is read-only if `isSystemRole === true`.
- **Two-column Grid:** Details card uses responsive grid layout for compact display.

## Future Enhancements
- Show users assigned to this role (link to users filtered by role).
- Permission breakdown visualization.
- Role usage statistics (number of users, last assigned date).
- Activity log for role changes.
- Clone role functionality (create new role based on existing one).
