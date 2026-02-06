# Finish Payment Screen Documentation

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
import { useGetAppointment } from '@/tanstack/useAppointments';
import { useServicePayment } from '@/tanstack/usePayments';
import { formatAppointmentDateTime, formatCurrency } from '@/utils';
import type { ServicePaymentPayload } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/appointments/:id/finish-payment`).
- **TanStack Query:** `useGetAppointment(id)` fetches appointment data to get remaining amount.
- **Service Payment Mutation:** `useServicePayment()` handles remaining amount payment initiation.
- **Local State:**
  - `method` - Payment method selected (MPESA or CARD, required)
  - `phone` - Phone number for MPESA payments (required if method is MPESA)
  - `email` - Email for CARD payments (required if method is CARD)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state

## UI Structure
- **Header Card:** Appointment information summary (customer, staff, date/time, services, remaining amount).
- **Form Card:** Payment method selection and payment details input.
- **Form Fields:** Payment method (radio/select), phone (for MPESA), email (for CARD).
- **Actions:** Cancel button (navigate back), Pay button (submit form and navigate to payment status).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Finish Payment                            │
│ Pay remaining amount for appointment.    │
├────────────────────────────────────────────┤
│ Appointment: Jan 25, 9:00 AM             │
│ Staff: Jane Smith                         │
│ Remaining Amount: KES 800                 │
├────────────────────────────────────────────┤
│ Payment Method: [MPESA] [CARD]           │
│ Phone: [+254712345678] (if MPESA)        │
│ Email: [customer@example.com] (if CARD)  │
├────────────────────────────────────────────┤
│ [Cancel]  [Pay Now]                       │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Finish Payment                                    │
│ Pay remaining amount for appointment.             │
│                                                    │
│ Appointment Details:                              │
│ • Date/Time: January 25, 2025, 9:00 AM           │
│ • Staff: Jane Smith                                │
│ • Services: Haircut, Trim                         │
│ • Remaining Amount: KES 800                        │
│                                                    │
│ Payment Method:                                    │
│ ○ MPESA  ● CARD                                    │
│                                                    │
│ Phone Number (MPESA):                             │
│ [+254712345678]                                   │
│                                                    │
│ Email (CARD):                                     │
│ [customer@example.com]                            │
│                                                    │
│ [Cancel]                          [Pay Now]       │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Payment Method:** Radio buttons or select dropdown with options: MPESA, CARD, `input-select` class (required).
- **Phone:** Text input for MPESA payments, `input` class (required if method is MPESA, format: +254XXXXXXXXX or 07XXXXXXXX).
- **Email:** Email input for CARD payments, `input` class (required if method is CARD).

## API Integration
- **Get Endpoint:** `GET /api/appointments/:appointmentId` via `useGetAppointment(appointmentId)`.
- **Service Payment Endpoint:** `POST /api/payments/service-payment` via `useServicePayment()` mutation.
- **Request Payload:**
  ```typescript
  {
    appointmentId: string,
    method: "MPESA" | "CARD",
    phone?: string, // Required for MPESA
    email?: string  // Required for CARD
  }
  ```
- **Note:** Payment amount is automatically set to `appointment.remainingAmount` by backend. No amount field required.
- **Response:** Payment initiation details including paymentId and checkoutRequestId (for MPESA) or authorizationUrl (for CARD).
- **Cache Invalidation:** Mutation invalidates `['payments']` and `['appointments']` queries.

## Components Used
- React Router DOM: `Link`, `useNavigate`, `useParams` for routing.
- TanStack Query: `useGetAppointment`, `useServicePayment` hooks.
- Tailwind CSS classes: `label`, `input`, `input-select`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching appointment data.
- **Error State:** Display `alert-error` with API error message if fetch or payment initiation fails.
- **Validation:** Client-side validation for required fields (method, phone/email based on method).
- **Remaining Amount Check:** Ensure remainingAmount > 0 before allowing payment.
- **Phone Validation:** Validate phone number format for MPESA (Kenyan format).
- **Email Validation:** Validate email format for CARD payments.
- **Submit Error:** Show inline error message if payment initiation fails, keep form data.
- **Success State:** Navigate to payment status page with paymentId and checkoutId.

## Navigation Flow
- Route: `/appointments/:id/finish-payment`.
- **Cancel Button:** Navigate back to `/appointments/:id` (appointment details).
- **Success:** After successful payment initiation, navigate to `/payments/status?paymentId=...&checkoutId=...` (payment status page).
- **Error:** Stay on finish payment page, show error message.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits payment initiation.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!appointment || appointment.remainingAmount <= 0) {
      setInlineMessage({ type: 'error', text: 'No remaining amount to pay.' });
      return;
    }
    if (!method) {
      setInlineMessage({ type: 'error', text: 'Please select a payment method.' });
      return;
    }
    if (method === 'MPESA' && !phone) {
      setInlineMessage({ type: 'error', text: 'Phone number is required for MPESA payments.' });
      return;
    }
    if (method === 'CARD' && !email) {
      setInlineMessage({ type: 'error', text: 'Email is required for CARD payments.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await servicePayment.mutateAsync({
        appointmentId: id,
        method: method === 'MPESA' ? 'MPESA' : 'CARD',
        phone: method === 'MPESA' ? phone : undefined,
        email: method === 'CARD' ? email : undefined
      });
      // Navigate to payment status page
      const paymentId = result.payment?._id || result.paymentId;
      const checkoutId = result.gateway?.checkoutRequestId;
      navigate(`/payments/status?paymentId=${paymentId}${checkoutId ? `&checkoutId=${checkoutId}` : ''}`);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to initiate payment.';
      setInlineMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  ```

- **`canSubmit`** — Computes whether form can be submitted.
  ```tsx
  const canSubmit = useMemo(() => {
    if (!appointment || appointment.remainingAmount <= 0 || !method || isSubmitting) return false;
    if (method === 'MPESA') return Boolean(phone?.trim());
    if (method === 'CARD') return Boolean(email?.trim());
    return false;
  }, [appointment, method, phone, email, isSubmitting]);
  ```

## Implementation Details
- **Remaining Amount Display:** Show remaining amount prominently from appointment data.
- **Payment Method Selection:** Radio buttons or select dropdown for choosing payment method.
- **Conditional Fields:** Phone input shown only for MPESA, email input shown only for CARD.
- **Payment Status Navigation:** After successful payment initiation, navigate to payment status page to track payment.

## Future Enhancements
- Partial payment option (pay less than remaining amount).
- Payment history for the appointment.
- Save payment method preference.
