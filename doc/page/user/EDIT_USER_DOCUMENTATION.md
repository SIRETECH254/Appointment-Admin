# Edit User Screen Documentation

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
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetUserById, useUpdateUser } from '@/tanstack/useUsers';
import type { IUser } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/users/:id/edit`).
- **TanStack Query:** `useGetUserById(id)` fetches user data for form pre-population.
- **Update Mutation:** `useUpdateUser()` handles user update with cache invalidation.
- **Local State:**
  - `firstName` - User's first name (required)
  - `lastName` - User's last name (required)
  - `email` - User's email (read-only, disabled)
  - `phone` - User's phone number (optional)
  - `role` - User's role (select dropdown)
  - `isActive` - User's active status (toggle/checkbox)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state

## UI Structure
- **Header Card:** Title "Edit User" with description.
- **Form Card:** Two-column grid layout with form fields.
- **Form Fields:** firstName, lastName, email (disabled), phone, roles (multi-select), isActive toggle.
- **Working Hours Section:** Displayed only if user has staff role, uses custom Tailwind CSS classes. Each day in a card with gray background, add/remove time slots per day.
- **Actions:** Cancel button (navigate back), Save button (submit form).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Edit User                                  │
│ Update user information and permissions.   │
├────────────────────────────────────────────┤
│ First Name    │ Last Name                  │
│ Email (read-only)                          │
│ Phone         │ Role                       │
│ Active Status (toggle)                     │
├────────────────────────────────────────────┤
│ [Cancel]  [Save Changes]                   │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Edit User                                          │
│ Update user information and permissions.          │
│                                                    │
│ First Name: [John              ]                  │
│ Last Name:  [Doe               ]                  │
│ Email:      [john@example.com] (disabled)         │
│ Phone:      [+254712345678     ]                  │
│ Roles:      [Multi-select: Admin, Staff ▼]        │
│ ☑ Active                                          │
│                                                    │
│ ────────────────────────────────────────────────  │
│ 🕐 Working Hours (if staff role selected)         │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ Monday                                        │ │
│ │ [09:00] to [17:00]  [×]  [+ Add Slot]       │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │ Tuesday                                       │ │
│ │ [09:00] to [17:00]  [×]  [+ Add Slot]       │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │ Wednesday                                     │ │
│ │ [09:00] to [17:00]  [×]  [+ Add Slot]       │ │
│ └──────────────────────────────────────────────┘ │
│ ... (Thursday, Friday, Saturday, Sunday)          │
│                                                    │
│ [Cancel]                    [Save Changes]        │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **First Name:** Text input (required), `input` class.
- **Last Name:** Text input (required), `input` class.
- **Email:** Text input (read-only, disabled), `input-disabled` class.
- **Phone:** Text input (optional), `input` class.
- **Role:** Select dropdown with available roles, `input-select` class.
- **Active Status:** Checkbox or toggle switch for `isActive` boolean.

## API Integration
- **Get Endpoint:** `GET /api/users/:userId` via `useGetUserById(userId)`.
- **Update Endpoint:** `PUT /api/users/:userId` via `useUpdateUser()` mutation.
- **Request Payload:**
  ```typescript
  {
    firstName: string,
    lastName: string,
    phone?: string,
    role?: string,
    isActive?: boolean
  }
  ```
- **Response:** Updated user object.
- **Cache Invalidation:** Mutation invalidates `['users']` and `['user', userId]` queries.

## Components Used
- React Router DOM: `Link`, `useNavigate`, `useParams` for routing.
- React Icons: `FiClock`, `FiPlus`, `FiX` for working hours section.
- TanStack Query: `useGetUserById`, `useUpdateUser`, `useGetAllRoles` hooks.
- MultiSelect: For role selection (multiple roles support).
- Tailwind CSS classes: `label`, `input`, `input-disabled`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`, `rounded-lg`, `border`, `bg-gray-50`, `p-4`.

## Error Handling
- **Loading State:** Show loading indicator while fetching user data.
- **Error State:** Display `alert-error` with API error message if fetch or update fails.
- **Validation:** Client-side validation for required fields (firstName, lastName).
- **Submit Error:** Show inline error message if update fails, keep form data.
- **Success State:** Show `alert-success` message, then navigate after 1.2 seconds.

## Navigation Flow
- Route: `/users/:id/edit`.
- **Cancel Button:** Navigate back to `/users` (user list).
- **Success:** After successful update, navigate to `/users` (user list).
- **Error:** Stay on edit page, show error message.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits update.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setInlineMessage({ type: 'error', text: 'First and last name are required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await updateUser.mutateAsync({
        userId: id,
        userData: { firstName, lastName, phone, role, isActive }
      });
      setInlineMessage({ type: 'success', text: 'User updated successfully.' });
      setTimeout(() => navigate('/users'), 1200);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to update user.';
      setInlineMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  ```

- **`hydrateForm`** — Pre-populates form fields from fetched user data.
  ```tsx
  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setEmail(user.email ?? '');
    setPhone(user.phone ?? '');
    setRole(user.roles?.[0]?.name ?? '');
    setIsActive(user.isActive ?? true);
  }, [user]);
  ```

- **`canSubmit`** — Computes whether form can be submitted.
  ```tsx
  const canSubmit = useMemo(() => {
    return Boolean(firstName.trim() && lastName.trim()) && !isSubmitting;
  }, [firstName, lastName, isSubmitting]);
  ```

## Future Enhancements
- Avatar upload functionality for user profile picture.
- Multiple role assignment (currently single role).
- Password reset functionality from admin panel.
- Activity log display (last login, last update, etc.).
- Permission management per role.
