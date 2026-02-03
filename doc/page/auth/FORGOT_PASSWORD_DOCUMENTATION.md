# Forgot Password Screen Documentation

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
import { Link } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the tree and exposes the `useAuth` hook.
- **Redux slice:** `redux/slices/authSlice.ts` retains `isLoading`, `error`, and auth metadata that the screen can surface.
- **Persistent storage:** `localStorage` keeps tokens and the serialized user; not modified in this flow.
- **Hook usage on forgot-password screen:** `const { forgotPassword, error, clearError } = useAuth();`
- **Form state:** single `form` object `{ email }` managed with `useState`.

**`forgotPassword` function (from `AuthContext.tsx`):**
```tsx
const forgotPassword = async (email: string): Promise<AuthResult> => {
  try {
    await authAPI.forgotPassword({ email });
    return { success: true };
  } catch (forgotError: any) {
    const errorMessage =
      forgotError?.response?.data?.message || forgotError?.message || 'Failed to send reset email';
    return { success: false, error: errorMessage };
  }
};
```

## UI Structure
- **Screen shell:** full-height `div` with a white background and centered content.
- **Typography:** HTML text elements styled with Tailwind utilities.
- **Layout helpers:** open layout (no card) with a max-width container.
- **Feedback:** inline success or error banners appear beneath the form to inform the user of API outcomes.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│    “Forgot password?”         │
├───────────────────────────────┤
│        Subtitle / Copy        │
│  (“Enter your email address”) │
├───────────────────────────────┤
│        Email Input            │
├───────────────────────────────┤
│   Primary Submit Button       │
├───────────────────────────────┤
│  Inline success / error text  │
├───────────────────────────────┤
│   Back to login link/button   │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│            White background                   │
│                                               │
│  Appointment Admin                            │
│  Forgot password?                             │
│  Enter your email address...                  │
│                                               │
│  Email  [______________________________]      │
│                                               │
│       [ Send reset link (gold) ]              │
│                                               │
│  Inline success / error message               │
│                                               │
│  Back to sign in                              │
└───────────────────────────────────────────────┘
```

## Form Inputs
- **Email field**
  ```tsx
  <input
    value={form.email}
    onChange={(event) => handleInputChange('email', event.target.value)}
    autoCapitalize="none"
    autoComplete="email"
    type="email"
    placeholder="admin@example.com"
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
  />
  ```

## API Integration
- **HTTP client:** Uses the shared axios instance exported from `api/config.ts`.
- **Endpoint:** `POST /api/auth/forgot-password`.
- **Payload:** `{ email: string }`.
- **Response contract:** Success returns a confirmation message; error responses populate `response.data.message`.
- **Token handling:** No token exchange occurs; the backend sends reset instructions to the provided email.

## Components Used
- React Router DOM: `Link`.
- Form elements: `input`, `button`, `label`, `div`, `p`.
- Tailwind CSS utility classes for spacing, typography, and color (white background + gold buttons).

## Error Handling
- `useAuth` surfaces API failures via the returned `AuthResult`.
- Client-side validation blocks submission when the email field is empty.
- `clearInlineMessage` clears stale errors once the user edits the field.
- Success responses render a green banner instructing the user to check their inbox.

## Navigation Flow
- Route: `/forgot-password`.
- Entry points:
  - Login screen’s “Forgot password?” link (`/login`).
  - Any guarded flow that needs password assistance.
- On success, the user remains on the page with success messaging and can navigate back to `/login`.
- Secondary navigation:
  - “Back to sign in” CTA ➞ `/login`.

## Functions Involved
- **`clearInlineMessage`** — clears banners and Redux auth errors when inputs change.
  ```tsx
  const clearInlineMessage = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineMessage(null);
  }, [error, clearError]);
  ```

- **`handleSubmit`** — validates input, calls `forgotPassword`, and updates status messaging.
  ```tsx
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setInlineMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    setInlineMessage(null);
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(trimmedEmail);
      if (!result.success) {
        setInlineMessage({ type: 'error', text: result.error ?? 'Unable to send reset link.' });
        return;
      }

      setInlineMessage({
        type: 'success',
        text: 'Check your inbox for password reset instructions.',
      });
    } catch {
      setInlineMessage({ type: 'error', text: 'Unexpected error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, forgotPassword]);
  ```

## Future Enhancements
- Add resend and support links when rate-limiting or delivery failures occur.
- Capture analytics (form submits, error reasons) for product feedback.
- Localize copy and validation messaging as part of internationalization.
- Extend the flow to handle phone-based recovery once backend supports SMS resets.
