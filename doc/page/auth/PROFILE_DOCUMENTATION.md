# Profile Screens Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframes](#sketch-wireframes)
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
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import {
  useChangePassword,
  useGetProfile,
  useUpdateProfile,
} from '@/tanstack/useUsers';
```

## Context and State Management
- **Auth context:** `useAuth()` provides `user` for immediate UI fallback.
- **TanStack Query:**
  - `useGetProfile()` fetches the latest profile data.
  - `useUpdateProfile()` updates user profile (JSON or `FormData`).
  - `useChangePassword()` updates account password.
- **Local UI state:** form fields, inline messages, avatar preview/file selection.
- **Persistent updates:** on successful profile update, the returned user record is stored in `localStorage` and Redux is updated to keep the navbar/user menu in sync.

## UI Structure
- **Profile overview:** avatar + name block, role and status badges, details card, CTA buttons.
- **Edit profile:** avatar picker and form fields; email is read-only.
- **Change password:** current password, new password, confirm password with visibility toggles.
- **Feedback:** inline success/error messages for submit actions.

## Planned Layout
```
Profile Overview
┌──────────────────────────────────────────┐
│ Avatar + Name + Role/Status              │
│ Email                                    │
├──────────────────────────────────────────┤
│ Contact + Account Details Card           │
├──────────────────────────────────────────┤
│ [Edit Profile]  [Change Password]        │
└──────────────────────────────────────────┘

Edit Profile
┌──────────────────────────────────────────┐
│ Avatar preview + Upload/Remove           │
│ First Name  Last Name                    │
│ Email (disabled)  Phone                  │
│ Inline error / success message           │
│ [Cancel]  [Save Changes]                 │
└──────────────────────────────────────────┘

Change Password
┌──────────────────────────────────────────┐
│ Current Password                         │
│ New Password                             │
│ Confirm Password                         │
│ Inline error / success message           │
│ [Update Password]                        │
└──────────────────────────────────────────┘
```

## Sketch Wireframes
```
Profile Overview
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
- **First name**
  ```tsx
  <input
    value={firstName}
    onChange={(event) => setFirstName(event.target.value)}
    placeholder="First name"
    className="form-input"
  />
  ```

- **Email (read-only)**
  ```tsx
  <input
    value={email}
    disabled
    className="form-input-disabled"
  />
  ```

- **Password field with visibility toggle**
  ```tsx
  <input
    value={newPassword}
    onChange={(event) => setNewPassword(event.target.value)}
    type={isPasswordVisible ? 'text' : 'password'}
    className="form-input-password"
  />
  ```

## API Integration
- **Get profile:** `GET /api/users/profile` via `useGetProfile()`.
- **Update profile:** `PUT /api/users/profile` via `useUpdateProfile()` with:
  - JSON payload for text-only updates.
  - `FormData` when uploading an avatar.
- **Change password:** `PUT /api/users/change-password` via `useChangePassword()`.
- **Response contract:** `data.data` returns a user object or `{ user }`.

## Components Used
- React + React Router DOM: `Link`, `useNavigate`.
- TanStack Query hooks for data fetching/mutations.
- Tailwind CSS utility classes (`btn-primary`, `form-input`, `form-message-*`).

## Error Handling
- Inline errors for validation (missing fields, mismatch passwords).
- API errors surface via `error.response?.data?.message` fallback to default messages.
- Loading state disables submit buttons to prevent double submissions.

## Navigation Flow
- Profile overview: `/profile`.
- Edit profile: `/profile/edit` (from Profile CTA).
- Change password: `/profile/change-password` (from Profile CTA).
- Navbar dropdown links to `/profile`.

## Functions Involved
- **`useGetProfile`** — reads server state and hydrates the profile view.
- **`handleSubmit` (Edit Profile)** — validates inputs and sends profile update.
  ```tsx
  const payload = avatarFile
    ? buildFormData()
    : { firstName, lastName, phone, avatar: avatarRemoved ? null : undefined };
  await updateProfile.mutateAsync(payload);
  ```
- **`handleSubmit` (Change Password)** — validates and sends password update.
  ```tsx
  await changePassword.mutateAsync({
    currentPassword,
    newPassword,
  });
  ```

## Future Enhancements
- Add avatar cropping and image size validation.
- Expose audit metadata (last login, last password change).
- Add client-side password strength meter.
- Support roles display as a multi-pill list for multi-role users.

