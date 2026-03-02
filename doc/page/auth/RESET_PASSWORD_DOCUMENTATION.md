# Reset Password Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Params and State Management](#params-and-state-management)
- [UI Structure](#ui-structure)
- [Form Inputs](#form-inputs)
- [Validation Rules](#validation-rules)
- [Sketch Wireframe](#sketch-wireframe)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Feedback & Loading States](#feedback--loading-states)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

import { useAuth } from '@/contexts/AuthContext';
```

## Params and State Management
- **Dynamic route:** `/reset-password/:token`, token arrives via `useParams`.
- **Auth hook:** `useAuth().resetPassword` handles API submission.
- **Local state:**
  - `form` object (`{ password, confirmPassword }`) — controlled inputs.
  - `inlineMessage` (`{ type: 'success' | 'error'; text: string } | null`) — success/error feedback banner.
  - `isSubmitting` (`boolean`) — gate multiple submissions.
  - `isPasswordVisible`, `isConfirmPasswordVisible` — show/hide toggles.
  - `redirectTimer` (`useRef<number | null>`) — manages delayed redirect.
- **Derived helpers:** `canSubmit` memoizes disabled state; error banner merges inline + auth error.

## UI Structure
- **Screen shell:** full-height `div` with white background and centered content.
- **Layout:** open layout (no card) with stacked inputs and CTA.
- **Feedback:** inline success/error banner rendered within the form.
- **Branding:** heading + subtitle consistent with login/forgot screens.

## Form Inputs
- **Password field** (includes show/hide toggle)
  ```tsx
  <input
    value={form.password}
    onChange={(event) => handleInputChange('password', event.target.value)}
    autoComplete="new-password"
    type={isPasswordVisible ? 'text' : 'password'}
    placeholder="••••••••"
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900"
  />
  ```

- **Confirm password field** (not sent to API; includes show/hide toggle)
  ```tsx
  <input
    value={form.confirmPassword}
    onChange={(event) => handleInputChange('confirmPassword', event.target.value)}
    autoComplete="new-password"
    type={isConfirmPasswordVisible ? 'text' : 'password'}
    placeholder="••••••••"
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900"
  />
  ```

## Validation Rules
1. Token must exist (guarded before submission; show inline error if missing).
2. Password fields required.
3. `password === confirmPassword`; mismatch yields inline error.
4. While busy (`isSubmitting`) disable button to prevent double submits.

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│            White background                  │
│                                               │
│  Appointment Admin                            │
│  Reset password                               │
│  Set a new password...                        │
│                                               │
│  New password     [____________________] (👁) │
│  Confirm password [____________________] (👁) │
│                                               │
│       [ Update password (gold) ]              │
│                                               │
│  Inline success / error message               │
│                                               │
│  Back to sign in                              │
└───────────────────────────────────────────────┘
```

## API Integration
- **HTTP client:** `useAuth().resetPassword(token, password)` calls `authAPI.resetPassword` (axios).
- **Endpoint:** `POST /api/auth/reset-password/:token`.
- **Payload:** `{ newPassword }` only — confirm field omitted intentionally.
- **Success path:** shows a green success banner and redirects back to `/login` after a short delay.
- **Error handling:** displays API message or fallback inline message.

## Components Used
- React Router DOM: `useParams`, `useNavigate`, `Link`.
- `react-icons/md` for password visibility toggles.
- Form elements: `input`, `button`, `label`, `div`, `p`.
- Tailwind CSS utility classes for layout, color, spacing (white background + gold buttons).

## Feedback & Loading States
- Inline banner uses Tailwind to swap colors:
  - Success → `bg-emerald-500/10`, `text-emerald-200`.
  - Error → `bg-red-500/10`, `text-red-200`.
- Submit button shows loading text when busy.
- Success message triggers timed navigation to login (`setTimeout`).

## Navigation Flow
- Route path: `/reset-password/:token`.
- Guards missing/invalid token by showing error and disabling submit handling.
- On success: navigate to `/login` with `replace`.
- Secondary link: footer CTA back to login.

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
- **`handleSubmit`** — orchestrates validation and API call.
  ```tsx
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setInlineMessage({ type: 'error', text: 'Reset link is missing or invalid.' });
      return;
    }

    if (!password || !confirmPassword) {
      setInlineMessage({ type: 'error', text: 'Enter and confirm your new password.' });
      return;
    }

    if (password !== confirmPassword) {
      setInlineMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    setInlineMessage(null);

    try {
      const result = await resetPassword(token, password);
      if (!result.success) {
        setInlineMessage({
          type: 'error',
          text: result.error ?? 'Unable to reset password.',
        });
        return;
      }

      setInlineMessage({
        type: 'success',
        text: 'Password updated! Redirecting to sign in...',
      });

      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch {
      setInlineMessage({ type: 'error', text: 'Unexpected error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [token, password, confirmPassword, resetPassword, navigate]);
  ```

## Future Enhancements
- Integrate password strength indicator and requirements checklist.
- Display countdown auto-redirect visibly instead of implicit timeout.
- Allow optional password paste detection or confirmation prompt.
