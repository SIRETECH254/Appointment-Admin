# Send Newsletter Screen Documentation

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
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiSend, FiX } from 'react-icons/fi';
import { useSendNewsletter, useGetSubscriptionStats } from '@/tanstack/useNewsletters';
import type { SendNewsletterPayload, NewsletterStatus } from '@/types/api.types';
```

## Context and State Management
- **Send Mutation:** `useSendNewsletter()` handles newsletter sending with cache invalidation.
- **Stats Query:** `useGetSubscriptionStats()` fetches subscription statistics for preview count.
- **Local State:**
  - `subject` - Newsletter subject (required)
  - `message` - Newsletter message content (required)
  - `status` - Target status filter: SUBSCRIBED, UNSUBSCRIBED, or BOUNCED (default: SUBSCRIBED)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state
- **Derived State:** `previewCount` - Memoized count of subscribers that will receive the newsletter based on status filter.

## UI Structure
- **Header Card:** Title "Send Newsletter" with description.
- **Form Card:** Form fields for status filter, preview count, subject, message, and action buttons.
- **Actions:** Cancel button (navigate back), Send Newsletter button (submit form).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Send Newsletter                           │
│ Send a newsletter to subscribers.         │
├────────────────────────────────────────────┤
│ Target Status: [Select Status ▼]          │
│ Preview: X subscribers will receive        │
│ Subject: [Enter subject...]               │
│ Message: [Enter message...]                │
│                                            │
│ [Cancel]  [Send Newsletter]               │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Send Newsletter                                   │
│ Send a newsletter to subscribers.                │
│                                                    │
│ Target Status: [Subscribed ▼]                     │
│   - Subscribed                                    │
│   - Unsubscribed                                  │
│   - Bounced                                       │
│                                                    │
│ 📧 85 subscribers will receive this newsletter    │
│                                                    │
│ Subject: [Monthly Newsletter        ]              │
│                                                    │
│ Message: [This is the newsletter content...      │
│          (textarea, multi-line)                    │
│                                                    │
│ [Cancel]                    [Send Newsletter]    │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Status Filter:** Select dropdown with options: Subscribed, Unsubscribed, Bounced (required), `input-select` class. Default: SUBSCRIBED.
- **Preview Count:** Display showing how many subscribers will receive the newsletter based on selected status.
- **Subject:** Text input (required), `input` class.
- **Message:** Textarea (required), `input` class with multiple rows (10 rows).

## API Integration
- **Send Endpoint:** `POST /api/newsletter/send` via `useSendNewsletter()` mutation.
- **Stats Endpoint:** `GET /api/newsletter/stats` via `useGetSubscriptionStats()` query.
- **Request Payload:**
  ```typescript
  {
    subject: string,
    message: string,
    status?: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'BOUNCED'
  }
  ```
- **Response Structure:**
  ```typescript
  {
    success: true,
    message: "Newsletter sent to 85 subscribers",
    data: {
      sentCount: number
    }
  }
  ```
- **Stats Response Structure:**
  ```typescript
  {
    success: true,
    data: {
      total: number,
      subscribed: number,
      unsubscribed: number,
      bounced: number,
      recentSubscriptions: number
    }
  }
  ```
- **Cache Invalidation:** Mutation invalidates `['newsletters']` and `['newsletter-stats']` queries to refresh list and stats.
- **Access Control:** Requires admin role (enforced by backend).

## Components Used
- React Router DOM: `Link`, `useNavigate` for routing.
- React Icons: `FiMail`, `FiSend`, `FiX` for icons.
- TanStack Query: `useSendNewsletter`, `useGetSubscriptionStats` hooks.
- Tailwind CSS classes: `label`, `input`, `input-select`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Validation:** Client-side validation for required fields (subject and message).
- **Preview Count Validation:** Ensure at least one subscriber exists with selected status before allowing send.
- **Submit Error:** Show inline error message with API error message if sending fails.
- **Success State:** Show success message with count of recipients, then navigate to newsletter list after 2 seconds.
- **Network Errors:** Gracefully handle network failures with user-friendly messages.

## Navigation Flow
- Route: `/newsletters/send`.
- **Access Control:** Only admin users can access (redirect if not admin).
- **Cancel Button:** Navigate back to `/newsletters` (newsletter list).
- **Success:** After successful sending, show success message, then navigate to `/newsletters` (newsletter list) after 2 seconds.
- **Error:** Stay on send page, show error message, keep form data.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits newsletter sending.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setInlineMessage({ type: 'error', text: 'Subject and message are required.' });
      return;
    }
    if (previewCount === 0) {
      setInlineMessage({ type: 'error', text: 'No subscribers found with the selected status.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: SendNewsletterPayload = {
        subject: subject.trim(),
        message: message.trim(),
        status,
      };
      await sendNewsletter.mutateAsync(payload);
      setInlineMessage({ type: 'success', text: `Newsletter sent successfully to ${previewCount} subscribers.` });
      setTimeout(() => navigate('/newsletters'), 2000);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to send newsletter.';
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
      subject.trim() &&
      message.trim() &&
      !isSubmitting
    );
  }, [subject, message, isSubmitting]);
  ```

- **`previewCount`** — Computes count of subscribers that will receive newsletter based on status filter.
  ```tsx
  const previewCount = useMemo(() => {
    if (!stats) return 0;
    switch (status) {
      case 'SUBSCRIBED':
        return stats.subscribed || 0;
      case 'UNSUBSCRIBED':
        return stats.unsubscribed || 0;
      case 'BOUNCED':
        return stats.bounced || 0;
      default:
        return 0;
    }
  }, [stats, status]);
  ```

- **`clearMessage`** — Clears inline message.

## Implementation Details
- **Status Filter:** Dropdown with three options matching backend API (SUBSCRIBED, UNSUBSCRIBED, BOUNCED).
- **Preview Count:** Dynamically updates based on selected status filter and subscription stats.
- **Subject Input:** Single-line text input for newsletter subject.
- **Message Textarea:** Multi-line textarea (10 rows) for newsletter message content.
- **Loading State:** Shows loading spinner in send button during submission.
- **Success Feedback:** Shows success message with recipient count, then auto-navigates after 2 seconds.
- **Error Feedback:** Shows error message inline, keeps form data for retry.
- **Access Control:** Check user role and redirect if not admin (can use `useAuth` hook to check user roles).

## Future Enhancements
- Rich text editor for message content (HTML/markdown support).
- Template selection for common newsletter types.
- Scheduled sending (send at specific date/time).
- Preview newsletter before sending.
- A/B testing support (send different versions to different groups).
- Newsletter analytics (open rates, click rates).
- Attachment support for newsletters.
- Personalization tokens (e.g., {{firstName}}, {{lastName}}).
