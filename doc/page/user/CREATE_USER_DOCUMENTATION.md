# Create User Screen Documentation

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
import { Link, useNavigate } from 'react-router-dom';
import { useAdminCreateUser } from '../../../tanstack/useUsers';
import type { AdminCreateUserPayload } from '../../../types/api.types';
```

## Context and State Management
- **Create Mutation:** `useAdminCreateUser()` handles user creation with cache invalidation.
- **Local State:**
  - `firstName` - User's first name (required)
  - `lastName` - User's last name (required)
  - `email` - User's email (required, must be unique)
  - `password` - User's password (required, min length validation)
  - `phone` - User's phone number (optional)
  - `role` - User's role (select dropdown, required)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state

## UI Structure
- **Header Card:** Title "Create User" with description.
- **Form Card:** Two-column grid layout with form fields.
- **Form Fields:** firstName, lastName, email, password, phone, role select.
- **Actions:** Cancel button (navigate back), Create button (submit form).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Create User                                │
│ Add a new user to the system.             │
├────────────────────────────────────────────┤
│ First Name    │ Last Name                  │
│ Email         │ Password                   │
│ Phone         │ Role                       │
├────────────────────────────────────────────┤
│ [Cancel]  [Create User]                   │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Create User                                        │
│ Add a new user to the system.                     │
│                                                    │
│ First Name: [John              ]                  │
│ Last Name:  [Doe               ]                  │
│ Email:      [john@example.com  ]                  │
│ Password:   [••••••••••••••••  ]                  │
│ Phone:      [+254712345678     ]                  │
│ Role:       [Admin ▼]                             │
│                                                    │
│ [Cancel]                    [Create User]         │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **First Name:** Text input (required), `input` class.
- **Last Name:** Text input (required), `input` class.
- **Email:** Text input (required, email validation), `input` class.
- **Password:** Password input (required, min 6 characters), `input-password` class.
- **Phone:** Text input (optional), `input` class.
- **Role:** Select dropdown with available roles (required), `input-select` class.

## API Integration
- **Endpoint:** `POST /api/users/admin-create` via `useAdminCreateUser()` mutation.
- **Request Payload:**
  ```typescript
  {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string
  }
  ```
- **Note:** Role assignment may be handled separately or included in payload depending on API implementation.
- **Response:** Created user object with `_id`.
- **Cache Invalidation:** Mutation invalidates `['users']` query to refresh list.

## Components Used
- React Router DOM: `Link`, `useNavigate` for routing.
- TanStack Query: `useAdminCreateUser` hook.
- Tailwind CSS classes: `label`, `input`, `input-password`, `input-select`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Validation:** Client-side validation for required fields and email format.
- **Password Validation:** Minimum length check (6+ characters recommended).
- **Email Uniqueness:** Server-side validation, display error if email already exists.
- **Submit Error:** Show inline `alert-error` with API error message if creation fails.
- **Success State:** Show `alert-success` message, then navigate to user details page.

## Navigation Flow
- Route: `/users/new`.
- **Cancel Button:** Navigate back to `/users` (user list).
- **Success:** After successful creation, navigate to `/users/:id` (newly created user's details page).
- **Error:** Stay on create page, show error message, keep form data.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits user creation.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setInlineMessage({ type: 'error', text: 'All required fields must be filled.' });
      return;
    }
    if (password.length < 6) {
      setInlineMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createUser.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined
      });
      setInlineMessage({ type: 'success', text: 'User created successfully.' });
      setTimeout(() => navigate(`/users/${result._id}`), 1200);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to create user.';
      setInlineMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  ```

- **`canSubmit`** — Computes whether form can be submitted.
  ```tsx
  const canSubmit = useMemo(() => {
    return Boolean(
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      password.trim() &&
      password.length >= 6 &&
      role &&
      !isSubmitting
    );
  }, [firstName, lastName, email, password, role, isSubmitting]);
  ```

- **`validateEmail`** — Validates email format (optional client-side check).
  ```tsx
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  ```

## Future Enhancements
- Password strength indicator.
- Email verification option (send verification email on creation).
- Bulk user import (CSV upload).
- Default role assignment based on user type.
- Welcome email notification to newly created users.
