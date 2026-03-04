# Create Notification Screen Documentation

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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSendNotification, useSendBulkNotification } from '../../../tanstack/useNotifications';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import type { SendNotificationPayload, SendBulkNotificationPayload, IUser } from '../../../types/api.types';
```

## Context and State Management
- **Create Mutation:** `useSendNotification()` handles notification creation with cache invalidation.
- **User List Query:** `useGetAllUsers()` fetches users for recipient selection (admin only).
- **Local State:**
  - `recipient` - Selected recipient user ID (required)
  - `type` - Notification type: email, sms, or in_app (required)
  - `category` - Notification category: general, appointment, or payment (required)
  - `subject` - Notification subject (required, max 200 characters)
  - `message` - Notification message (required)
  - `metadata` - Optional metadata object (JSON string input)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state
- **Access Control:** Only admin users can access this screen.

## UI Structure
- **Header Card:** Title "Create Notification" with description.
- **Form Card:** Form fields for recipient, type, category, subject, message, and optional metadata.
- **Actions:** Cancel button (navigate back), Send Notification button (submit form).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Create Notification                       │
│ Send a notification to a user.           │
├────────────────────────────────────────────┤
│ Recipient: [Select User ▼]                │
│ Type: [Select Type ▼]                     │
│ Category: [Select Category ▼]            │
│ Subject: [Enter subject...]               │
│ Message: [Enter message...]               │
│ Metadata (optional): [JSON string]        │
├────────────────────────────────────────────┤
│ [Cancel]  [Send Notification]             │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Create Notification                                │
│ Send a notification to a user.                    │
│                                                    │
│ Recipient: [Select User ▼]                        │
│   - John Doe (john@example.com)                    │
│   - Jane Smith (jane@example.com)                 │
│                                                    │
│ Type: [Select Type ▼]                             │
│   - Email                                          │
│   - SMS                                            │
│   - In-app                                         │
│                                                    │
│ Category: [Select Category ▼]                     │
│   - General                                        │
│   - Appointment                                    │
│   - Payment                                        │
│                                                    │
│ Subject: [Appointment Confirmed        ]           │
│                                                    │
│ Message: [Your appointment for Haircut is          │
│          confirmed on January 15, 2025...]        │
│          (textarea, multi-line)                    │
│                                                    │
│ Metadata (optional): [{                           │
│   "appointmentId": "abc123"                       │
│ }]                                                 │
│                                                    │
│ [Cancel]                    [Send Notification]   │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Recipient:** Select dropdown with user list (required), `input-select` class. Shows user name and email.
- **Type:** Select dropdown with options: Email, SMS, In-app (required), `input-select` class.
- **Category:** Select dropdown with options: General, Appointment, Payment (required), `input-select` class.
- **Subject:** Text input (required, max 200 characters), `input` class.
- **Message:** Textarea (required), `input` class with multiple rows.
- **Metadata:** Textarea for JSON string input (optional), `input` class.

## API Integration
- **Endpoint:** `POST /api/notifications` via `useSendNotification()` mutation.
- **Request Payload:**
  ```typescript
  {
    recipient: string, // user ID
    type: 'email' | 'sms' | 'in_app',
    category: 'general' | 'appointment' | 'payment',
    subject: string,
    message: string,
    metadata?: Record<string, any>,
    actions?: INotificationAction[],
    context?: INotificationContext,
    expiresAt?: string
  }
  ```
- **Response:** Created notification object with `_id`.
- **Cache Invalidation:** Mutation invalidates `['notifications']` query to refresh list.
- **Access Control:** Requires admin role (enforced by backend).

## Components Used
- React Router DOM: `Link`, `useNavigate` for routing.
- TanStack Query: `useSendNotification`, `useGetAllUsers` hooks.
- Tailwind CSS classes: `label`, `input`, `input-select`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Validation:** Client-side validation for required fields and subject length (max 200 characters).
- **Recipient Validation:** Ensure recipient is selected.
- **Type/Category Validation:** Ensure valid type and category are selected.
- **Metadata Validation:** Validate JSON format if provided.
- **Submit Error:** Show inline `alert-error` with API error message if creation fails.
- **Success State:** Show `alert-success` message, then navigate to notification details page or list.

## Navigation Flow
- Route: `/notifications/new`.
- **Access Control:** Only admin users can access (redirect if not admin).
- **Cancel Button:** Navigate back to `/notifications` (notification list).
- **Success:** After successful creation, navigate to `/notifications/:id` (newly created notification's details page) or `/notifications` (notification list).
- **Error:** Stay on create page, show error message, keep form data.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits notification creation.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recipient || !type || !category || !subject.trim() || !message.trim()) {
      setInlineMessage({ type: 'error', text: 'All required fields must be filled.' });
      return;
    }
    if (subject.trim().length > 200) {
      setInlineMessage({ type: 'error', text: 'Subject cannot exceed 200 characters.' });
      return;
    }
    setIsSubmitting(true);
    try {
      let parsedMetadata = undefined;
      if (metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(metadata.trim());
        } catch {
          setInlineMessage({ type: 'error', text: 'Invalid JSON format for metadata.' });
          setIsSubmitting(false);
          return;
        }
      }
      const result = await sendNotification.mutateAsync({
        recipient,
        type,
        category,
        subject: subject.trim(),
        message: message.trim(),
        metadata: parsedMetadata,
      });
      setInlineMessage({ type: 'success', text: 'Notification sent successfully.' });
      setTimeout(() => navigate(`/notifications/${result.notification._id}`), 1200);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to send notification.';
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
      recipient &&
      type &&
      category &&
      subject.trim() &&
      message.trim() &&
      subject.trim().length <= 200 &&
      !isSubmitting
    );
  }, [recipient, type, category, subject, message, isSubmitting]);
  ```

- **`validateMetadata`** — Validates JSON format for metadata (optional).
  ```tsx
  const validateMetadata = (metadataString: string): boolean => {
    if (!metadataString.trim()) return true; // Optional field
    try {
      JSON.parse(metadataString.trim());
      return true;
    } catch {
      return false;
    }
  };
  ```

## Implementation Details
- **Recipient Selection:** Dropdown populated with users from `useGetAllUsers()` hook, showing name and email.
- **Type Selection:** Dropdown with three options matching backend API (email, sms, in_app).
- **Category Selection:** Dropdown with three options matching backend API (general, appointment, payment).
- **Subject Validation:** Maximum 200 characters as per backend validation.
- **Message Textarea:** Multi-line textarea for notification message content.
- **Metadata Input:** Optional JSON textarea with validation for proper JSON format.
- **Access Control:** Check user role and redirect if not admin (can use `useAuth` hook to check user roles).

## Future Enhancements
- Rich text editor for message content (HTML/markdown support).
- Action builder UI for bidirectional notifications.
- Context builder UI for notification context.
- Expiration date picker for notification expiration.
- Preview notification before sending.
- Template selection for common notification types.
- Bulk notification sending to multiple recipients.
