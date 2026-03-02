# Contact Reply Screen Documentation

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
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useGetContactMessageById, useReplyToContactMessage } from '@/tanstack/useContact';
import { formatDateTimeWithTime } from '@/utils/contactUtils';
import type { IContact } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/contact/:id/reply`).
- **TanStack Query:** `useGetContactMessageById(id)` fetches contact data for context.
- **Reply Mutation:** `useReplyToContactMessage()` handles sending reply with cache invalidation.
- **Local State:**
  - `replyMessage` - Reply message text (required, max 2000 characters)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state

## UI Structure
- **Header Card:** Contact context (subject, recipient email, original message preview) and back button.
- **Reply Form Card:** Reply message textarea with character count, submit button, and cancel button.
- **Contact Context:** Display original contact information for reference.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ [Back] Reply to Contact                    │
│                                            │
│ To: email@example.com                     │
│ Subject: Re: Contact subject              │
│ Original Message: [Preview]               │
├────────────────────────────────────────────┤
│ Reply Message                              │
│                                            │
│ [Textarea for reply message...]           │
│ Character count: 0/2000                    │
│                                            │
│ [Cancel]  [Send Reply]                    │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ ← Back  Reply to Contact                            │
│                                                    │
│ To: john@example.com                               │
│ Subject: Re: Booking Enquiry                       │
│                                                    │
│ Original Message:                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ I would like to know your availability next  │ │
│ │ week. I'm interested in scheduling an         │ │
│ │ appointment for a haircut.                    │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ Reply Message:                                     │
│ ┌──────────────────────────────────────────────┐ │
│ │ Thank you for reaching out. We have           │ │
│ │ availability next week. Please let us know    │ │
│ │ your preferred date and time.                 │ │
│ │                                                │ │
│ │ Best regards,                                  │ │
│ │ Admin Team                                     │ │
│ └──────────────────────────────────────────────┘ │
│ Character count: 145/2000                         │
│                                                    │
│ [Cancel]                    [Send Reply]         │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Reply Message:** Textarea (required, max 2000 characters), `input` class with multiple rows. Shows character count.
- **Cancel Button:** Navigate back to contact details or list.
- **Send Reply Button:** Submit form and send reply email.

## API Integration
- **Get Endpoint:** `GET /api/contact/:contactId` via `useGetContactMessageById(contactId)` for context.
- **Reply Endpoint:** `POST /api/contact/:contactId/reply` via `useReplyToContactMessage()` mutation.
- **Request Payload:**
  ```typescript
  {
    reply: string  // Max 2000 characters
  }
  ```
- **Note:** Backend API expects `message` field, but frontend type uses `reply`. API layer should handle mapping.
- **Response:** Updated contact object with status set to REPLIED.
- **Cache Invalidation:** Mutation invalidates `['contact', 'messages']` and `['contact', contactId]` queries.

## Components Used
- React Router DOM: `Link`, `useNavigate`, `useParams` for routing.
- React Icons: `MdArrowBack` for back button.
- TanStack Query: `useGetContactMessageById`, `useReplyToContactMessage` hooks.
- Tailwind CSS classes: `label`, `input`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching contact data.
- **Error State:** Display `alert-error` with API error message if fetch or reply fails.
- **Validation:** Client-side validation for required field and max length (2000 characters).
- **Submit Error:** Show inline error message if reply fails, keep form data.
- **Success State:** Show `alert-success` message, then navigate to contact details page.

## Navigation Flow
- Route: `/contact/:id/reply`.
- **Back Button:** Navigate back to `/contact/:id` (ContactDetails page).
- **Cancel Button:** Navigate back to `/contact/:id` (ContactDetails page).
- **Success:** After successful reply, navigate to `/contact/:id` (ContactDetails page) to see updated status.
- **Error:** Stay on reply page, show error message, keep form data.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits reply.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!replyMessage.trim()) {
      setInlineMessage({ type: 'error', text: 'Reply message is required.' });
      return;
    }
    if (replyMessage.trim().length > 2000) {
      setInlineMessage({ type: 'error', text: 'Reply message must be at most 2000 characters.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await replyToContact.mutateAsync({
        contactId: id,
        replyData: { reply: replyMessage.trim() }
      });
      setInlineMessage({ type: 'success', text: 'Reply sent successfully.' });
      setTimeout(() => navigate(`/contact/${id}`), 1200);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to send reply.';
      setInlineMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  ```

- **`canSubmit`** — Computes whether form can be submitted.
  ```tsx
  const canSubmit = useMemo(() => {
    return Boolean(replyMessage.trim() && replyMessage.trim().length <= 2000 && !isSubmitting);
  }, [replyMessage, isSubmitting]);
  ```

- **`getRecipientEmail`** — Gets recipient email (user email if userId exists, otherwise contact email).
  ```tsx
  const getRecipientEmail = useMemo(() => {
    if (!contact) return '';
    if (contact.userId && typeof contact.userId === 'object' && contact.userId.email) {
      return contact.userId.email;
    }
    return contact.email;
  }, [contact]);
  ```

- **`formatDateTimeWithTime`** — Formats ISO timestamps with time for display (from `@/utils/contactUtils`).
  ```tsx
  import { formatDateTimeWithTime } from '@/utils/contactUtils';
  // Usage: formatDateTimeWithTime(contact.createdAt)
  ```

## Implementation Details
- **Character Count:** Display character count (e.g., "145/2000") below textarea, update in real-time.
- **Recipient Email:** If contact has `userId` (populated user object), use user's email; otherwise use contact's email.
- **Subject Prefix:** Display "Re: " prefix with original subject for context.
- **Original Message Preview:** Show truncated original message for reference (optional, can be expandable).
- **Textarea Rows:** Use appropriate number of rows (e.g., 8-10) for comfortable typing.
- **Validation Feedback:** Show character count warning when approaching limit (e.g., red text at 1900+ characters).

## Future Enhancements
- Rich text editor for reply message (HTML formatting support).
- Reply templates for common responses.
- Attachments support (if backend supports).
- Reply history display (if multiple replies are supported).
- Auto-save draft replies.
- Email preview before sending.
