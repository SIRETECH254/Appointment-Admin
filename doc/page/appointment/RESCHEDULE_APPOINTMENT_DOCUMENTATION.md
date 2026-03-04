# Reschedule Appointment Screen Documentation

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
import { useGetAppointment, useRescheduleAppointment } from '../../../tanstack/useAppointments';
import { formatAppointmentDateTime } from '../../../utils/appointmentUtils';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/appointments/:id/reschedule`).
- **TanStack Query:** `useGetAppointment(id)` fetches appointment data for display.
- **Reschedule Mutation:** `useRescheduleAppointment()` handles appointment rescheduling.
- **Local State:**
  - `startTime` - New appointment start time (required)
  - `endTime` - New appointment end time (required, computed from services or manual)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state

## UI Structure
- **Header Card:** Current appointment information (date/time, staff, services).
- **Form Card:** Date/time picker for new appointment time.
- **Form Fields:** Start time (datetime picker), end time (datetime picker or computed).
- **Actions:** Cancel button (navigate back), Reschedule button (submit form).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Reschedule Appointment                     │
│ Change the appointment date and time.     │
├────────────────────────────────────────────┤
│ Current: Jan 25, 9:00 AM - 10:30 AM      │
│ Staff: Jane Smith                         │
├────────────────────────────────────────────┤
│ New Start Time: [2025-01-26] [10:00]     │
│ New End Time: [2025-01-26] [11:30]       │
├────────────────────────────────────────────┤
│ [Cancel]  [Reschedule]                    │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Reschedule Appointment                            │
│ Change the appointment date and time.             │
│                                                    │
│ Current Appointment:                              │
│ • Date/Time: January 25, 2025, 9:00 AM - 10:30 AM│
│ • Staff: Jane Smith                                │
│ • Services: Haircut, Trim                          │
│                                                    │
│ New Appointment Time:                             │
│ Start Time: [2025-01-26] [10:00 AM]              │
│ End Time: [2025-01-26] [11:30 AM] (auto-calc)    │
│                                                    │
│ [Cancel]                    [Reschedule]          │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Start Time:** Date and time picker for new start time, `input` class (required).
- **End Time:** Date and time picker for new end time or auto-calculated from services duration, `input` class (required).

## API Integration
- **Get Endpoint:** `GET /api/appointments/:appointmentId` via `useGetAppointment(appointmentId)`.
- **Reschedule Endpoint:** `PATCH /api/appointments/:id/reschedule` via `useRescheduleAppointment()` mutation.
- **Request Payload:**
  ```typescript
  {
    startTime: string, // ISO 8601 format
    endTime: string    // ISO 8601 format
  }
  ```
- **Note:** Backend validates slot availability (working hours, breaks, existing appointments).
- **Response:** Updated appointment object with new startTime and endTime.
- **Cache Invalidation:** Mutation invalidates `['appointments']` and `['appointment', id]` queries.

## Components Used
- React Router DOM: `Link`, `useNavigate`, `useParams` for routing.
- TanStack Query: `useGetAppointment`, `useRescheduleAppointment` hooks.
- Tailwind CSS classes: `label`, `input`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching appointment data.
- **Error State:** Display `alert-error` with API error message if fetch or reschedule fails.
- **Validation:** Client-side validation for required fields (startTime, endTime).
- **Time Validation:** Ensure startTime is in the future and endTime > startTime.
- **Slot Availability:** Backend validates slot availability and returns error if slot is unavailable.
- **Submit Error:** Show inline error message if reschedule fails, keep form data.
- **Success State:** Show `alert-success` message, then navigate to appointment details page.

## Navigation Flow
- Route: `/appointments/:id/reschedule`.
- **Cancel Button:** Navigate back to `/appointments/:id` (appointment details).
- **Success:** After successful reschedule, navigate to `/appointments/:id` (appointment details page).
- **Error:** Stay on reschedule page, show error message.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits appointment reschedule.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startTime || !endTime) {
      setInlineMessage({ type: 'error', text: 'Start time and end time are required.' });
      return;
    }
    if (new Date(startTime) <= new Date()) {
      setInlineMessage({ type: 'error', text: 'Appointment time must be in the future.' });
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setInlineMessage({ type: 'error', text: 'End time must be after start time.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await rescheduleAppointment.mutateAsync({
        appointmentId: id,
        data: {
          startTime,
          endTime
        }
      });
      setInlineMessage({ type: 'success', text: 'Appointment rescheduled successfully.' });
      setTimeout(() => navigate(`/appointments/${id}`), 1200);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to reschedule appointment.';
      setInlineMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  ```

- **`calculateEndTime`** — Computes end time from start time and appointment services duration.
  ```tsx
  const calculateEndTime = useCallback((start: string) => {
    if (!start || !appointment) return '';
    const totalDuration = appointment.services.reduce((sum, service) => {
      return sum + (service.duration || 0);
    }, 0);
    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + totalDuration * 60000);
    return endDate.toISOString();
  }, [appointment]);
  ```

- **`canSubmit`** — Computes whether form can be submitted.
  ```tsx
  const canSubmit = useMemo(() => {
    return Boolean(
      startTime &&
      endTime &&
      new Date(startTime) > new Date() &&
      new Date(endTime) > new Date(startTime) &&
      !isSubmitting
    );
  }, [startTime, endTime, isSubmitting]);
  ```

## Implementation Details
- **Current Appointment Display:** Show current appointment details for reference.
- **Auto-calculation:** End time can be auto-calculated from start time and services duration.
- **Slot Validation:** Backend validates slot availability before rescheduling.
- **Status Requirement:** Only CONFIRMED appointments can be rescheduled (enforced by backend).

## Future Enhancements
- Calendar view for selecting new date.
- Available time slots display.
- Suggest alternative times if selected slot is unavailable.
- Reschedule history tracking.
