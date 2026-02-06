# Appointment Details Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Action Buttons](#action-buttons)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGetAppointment, useConfirmAppointment, useRescheduleAppointment, useCancelAppointment, useCheckInAppointment, useCompleteAppointment, useMarkNoShowAppointment } from '@/tanstack/useAppointments';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatAppointmentDateTime, formatAppointmentStatus, getAppointmentStatusVariant, canRescheduleAppointment, canCancelAppointment, canCheckInAppointment } from '@/utils/appointmentUtils';
import { formatCurrency } from '@/utils/paymentUtils';
import type { IAppointment } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/appointments/:id`).
- **TanStack Query:** `useGetAppointment(id)` fetches appointment data.
- **Mutations:**
  - `useConfirmAppointment()` - Confirm appointment with payment
  - `useRescheduleAppointment()` - Reschedule appointment
  - `useCancelAppointment()` - Cancel appointment
  - `useCheckInAppointment()` - Check in customer
  - `useCompleteAppointment()` - Mark appointment as completed
  - `useMarkNoShowAppointment()` - Mark appointment as no-show
- **Local State:**
  - `confirmModalOpen` - Confirmation modal visibility for destructive actions
  - `actionToConfirm` - The action to be confirmed (cancel, no-show, etc.)
  - `inlineMessage` - Success/error feedback message

## UI Structure
- **Header Card:** Appointment ID, status badge, customer and staff information.
- **Details Card:** Appointment information (date/time, services, amounts, notes).
- **Payment Information Card:** Booking fee, remaining amount, payment status.
- **Action Buttons:** Contextual buttons based on appointment status.
- **Confirmation Modals:** Modals for destructive actions (cancel, no-show).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Appointment Details                        │
│ Status: [Pending]                          │
│ Customer: John Doe                        │
│ Staff: Jane Smith                          │
├────────────────────────────────────────────┤
│ Date/Time: Jan 25, 2025 9:00 AM - 10:30 AM│
│ Services: Haircut, Trim                   │
│ Booking Fee: KES 200                      │
│ Remaining: KES 800                        │
├────────────────────────────────────────────┤
│ [Confirm] [Reschedule] [Cancel]          │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│ Appointment #APT-2025-0001                                │
│ Status: [Pending]                                          │
│                                                            │
│ Customer: John Doe (john@example.com)                    │
│ Staff: Jane Smith                                          │
│                                                            │
│ Date/Time: January 25, 2025, 9:00 AM - 10:30 AM           │
│ Services: Haircut (30 min), Trim (15 min)                 │
│                                                            │
│ Payment Information:                                       │
│ • Booking Fee: KES 200 (Paid)                             │
│ • Remaining Amount: KES 800 (Unpaid)                      │
│                                                            │
│ [Confirm Appointment] [Reschedule] [Cancel]               │
└────────────────────────────────────────────────────────────┘
```

## Action Buttons

### PENDING Status
- **Confirm Appointment** - Navigate to `/appointments/:id/confirm` (payment method selection)
- **Reschedule** - Navigate to `/appointments/:id/reschedule`
- **Cancel** - Open confirmation modal, then cancel appointment

### CONFIRMED Status
- **Check In** - Mark customer as checked in (staff/admin only)
- **Reschedule** - Navigate to `/appointments/:id/reschedule`
- **Cancel** - Open confirmation modal, then cancel appointment (only if 2+ hours before start)
- **Finish Payment** - Navigate to `/appointments/:id/finish-payment` (if remainingAmount > 0)

### Checked In (CONFIRMED with checkedInAt)
- **Complete** - Mark appointment as completed (staff only)
- **Mark No-Show** - Mark appointment as no-show (staff/admin only)

### COMPLETED Status
- **View Only** - No action buttons, display completed information

### CANCELLED / NO_SHOW Status
- **View Only** - No action buttons, display cancellation/no-show information

## API Integration
- **Get Endpoint:** `GET /api/appointments/:appointmentId` via `useGetAppointment(appointmentId)`.
- **Confirm Endpoint:** `POST /api/appointments/:id/confirm` via `useConfirmAppointment()` mutation.
- **Reschedule Endpoint:** `PATCH /api/appointments/:id/reschedule` via `useRescheduleAppointment()` mutation.
- **Cancel Endpoint:** `PATCH /api/appointments/:id/cancel` via `useCancelAppointment()` mutation.
- **Check In Endpoint:** `PATCH /api/appointments/:id/check-in` via `useCheckInAppointment()` mutation.
- **Complete Endpoint:** `PATCH /api/appointments/:id/complete` via `useCompleteAppointment()` mutation.
- **No-Show Endpoint:** `PATCH /api/appointments/:id/no-show` via `useMarkNoShowAppointment()` mutation.
- **Response:** Appointment object with populated customer, staff, and services.

## Components Used
- React Router DOM: `Link`, `useNavigate`, `useParams` for routing.
- TanStack Query: `useGetAppointment`, mutation hooks for appointment actions.
- Custom Components: `ConfirmModal` for destructive action confirmations.
- Utility Functions: `formatAppointmentDateTime`, `formatAppointmentStatus`, `getAppointmentStatusVariant`, `canRescheduleAppointment`, `canCancelAppointment`, `canCheckInAppointment` from `@/utils/appointmentUtils`, `formatCurrency` from `@/utils/paymentUtils`.
- Tailwind CSS classes: `btn-primary`, `btn-secondary`, `btn-ghost`, `badge`, `badge-success`, `badge-error`, `badge-soft`, `alert-success`, `alert-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching appointment data.
- **Error State:** Display `alert-error` with API error message if fetch or mutation fails.
- **Validation:** Client-side validation for action availability (check status, time constraints).
- **Mutation Error:** Show inline error message if action fails, keep appointment data.
- **Success State:** Show `alert-success` message, then refresh appointment data.

## Navigation Flow
- Route: `/appointments/:id`.
- **Confirm Button:** Navigate to `/appointments/:id/confirm` (ConfirmAppointment page).
- **Reschedule Button:** Navigate to `/appointments/:id/reschedule` (RescheduleAppointment page).
- **Finish Payment Button:** Navigate to `/appointments/:id/finish-payment` (FinishPayment page).
- **Back Button:** Navigate to `/appointments` (AppointmentList page).

## Functions Involved
- **`formatAppointmentDateTime`** — Formats appointment date and time for display.
  ```tsx
  import { formatAppointmentDateTime } from '@/utils/appointmentUtils';
  // Usage: formatAppointmentDateTime(appointment.startTime)
  ```

- **`canRescheduleAppointment`** — Checks if appointment can be rescheduled (must be CONFIRMED).
  ```tsx
  import { canRescheduleAppointment } from '@/utils/appointmentUtils';
  // Usage: canRescheduleAppointment(appointment)
  ```

- **`canCancelAppointment`** — Checks if appointment can be cancelled (must be CONFIRMED and 2+ hours before start).
  ```tsx
  import { canCancelAppointment } from '@/utils/appointmentUtils';
  // Usage: canCancelAppointment(appointment)
  ```

- **`canCheckInAppointment`** — Checks if appointment can be checked in (must be CONFIRMED and on same day).
  ```tsx
  import { canCheckInAppointment } from '@/utils/appointmentUtils';
  // Usage: canCheckInAppointment(appointment)
  ```

- **`handleCancel`** — Opens cancel confirmation modal.
  ```tsx
  const handleCancel = useCallback(() => {
    setActionToConfirm('cancel');
    setConfirmModalOpen(true);
  }, []);
  ```

- **`handleCancelConfirm`** — Confirms and executes cancellation.
  ```tsx
  const handleCancelConfirm = useCallback(async () => {
    try {
      await cancelAppointment.mutateAsync({ appointmentId: id, data: {} });
      setConfirmModalOpen(false);
      setInlineMessage({ type: 'success', text: 'Appointment cancelled successfully.' });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to cancel appointment.';
      setInlineMessage({ type: 'error', text: errorMessage });
    }
  }, [id, cancelAppointment]);
  ```

## Implementation Details
- **Status-Based Actions:** Action buttons are conditionally rendered based on appointment status and business rules.
- **Confirmation Modals:** Destructive actions (cancel, no-show) require confirmation via `ConfirmModal`.
- **Real-time Updates:** After mutations, appointment data is refreshed via TanStack Query cache invalidation.
- **Payment Information:** Display booking fee and remaining amount with payment status indicators.
- **Service List:** Display all services with durations and prices.

## Future Enhancements
- Appointment history timeline.
- Customer communication log.
- Payment history for the appointment.
- Reschedule history.
- Notes and internal comments.
- Email/SMS notification triggers.
