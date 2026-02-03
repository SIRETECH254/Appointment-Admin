# Change Password Screen Documentation

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
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

import { useChangePassword } from '@/tanstack/useUsers';
```

## Context and State Management
- **TanStack Query:** `useChangePassword()` mutation posts password changes.
- **Local form state:** `currentPassword`, `newPassword`, `confirmPassword`.
- **UI state:** password visibility toggles and inline feedback.

## UI Structure
- **Header:** title + helper text.
- **Form:** three password fields with visibility toggles.
- **Submit:** single CTA with disabled state while submitting.
- **Feedback:** inline success/error message below inputs.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Change password                            │
│ Update your password...                    │
├────────────────────────────────────────────┤
│ Current password [___________] (👁)        │
│ New password [_______________] (👁)        │
│ Confirm password [___________] (👁)        │
├────────────────────────────────────────────┤
│ Inline success / error                     │
│ [Update password]                          │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Change password                                    │
│ Update your password to keep your account secure.  │
│                                                    │
│ Current password [____________________] (👁)       │
│ New password [________________________] (👁)       │
│ Confirm password [____________________] (👁)       │
│                                                    │
│ [Update password]                                  │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Password field**
  ```tsx
  <input
    value={form.currentPassword}
    onChange={(event) =>
      handleInputChange('currentPassword', event.target.value)
    }
    type={isCurrentVisible ? 'text' : 'password'}
    className="form-input-password"
  />
  ```

## API Integration
- **Endpoint:** `PUT /api/users/change-password`.
- **Payload:** `{ currentPassword: string; newPassword: string }`.
- **Hook:** `useChangePassword()` mutation.

## Components Used
- `react-icons/md` for visibility toggles.
- Tailwind CSS utilities: `form-input-password`, `btn-primary`.

## Error Handling
- Validate required fields and password confirmation match.
- API errors use `error.response?.data?.message` fallback.
- Inline banner displays `success` or `error` state.

## Navigation Flow
- Route: `/profile/change-password`.
- On success, the screen remains and clears the form.

## Functions Involved
- **`handleSubmit`** — validates and triggers mutation.
  ```tsx
  await changePassword.mutateAsync({
    currentPassword: form.currentPassword,
    newPassword: form.newPassword,
  });
  ```

## Future Enhancements
- Add password strength meter.
- Require minimum length/complexity on the client.
- Offer sign-out of other sessions after change.

