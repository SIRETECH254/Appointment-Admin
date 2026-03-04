# Service Payment Screen Documentation

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
import { useInitiatePayment } from '../../../tanstack/usePayments';
import { useGetAllServices } from '../../../tanstack/useServices';
import { formatCurrency } from '../../../utils/paymentUtils';
```

## Context and State Management
- **Initiate Payment Mutation:** `useInitiatePayment()` handles service-only payment initiation.
- **Service Query:** `useGetAllServices()` fetches available services for selection.
- **Local State:**
  - `services` - Array of selected service IDs (required, min 1)
  - `method` - Payment method selected (MPESA or CARD, required)
  - `phone` - Phone number for MPESA payments (required if method is MPESA)
  - `email` - Email for CARD payments (required if method is CARD)
  - `totalAmount` - Calculated total amount from selected services (computed)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state

## UI Structure
- **Header Card:** Title "Service Payment" with description.
- **Form Card:** Service selection, payment method selection, and payment details input.
- **Form Fields:** Services (multi-select), payment method (radio/select), phone (for MPESA), email (for CARD), total amount display.
- **Actions:** Cancel button (navigate back), Pay button (submit form and navigate to payment status).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Service Payment                          │
│ Pay for services without an appointment.  │
├────────────────────────────────────────────┤
│ Services: [☑ Haircut] [☑ Trim]          │
│ Total Amount: KES 500                     │
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
│ Service Payment                                   │
│ Pay for services without an appointment.           │
│                                                    │
│ Select Services:                                   │
│ ☑ Haircut (KES 300, 30 min)                       │
│ ☑ Trim (KES 200, 15 min)                          │
│ ☐ Massage (KES 500, 60 min)                       │
│                                                    │
│ Total Amount: KES 500                              │
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
- **Services:** Multi-select dropdown or checkboxes with available services, `input-select` class (required, min 1).
- **Payment Method:** Radio buttons or select dropdown with options: MPESA, CARD, `input-select` class (required).
- **Phone:** Text input for MPESA payments, `input` class (required if method is MPESA, format: +254XXXXXXXXX or 07XXXXXXXX).
- **Email:** Email input for CARD payments, `input` class (required if method is CARD).

## API Integration
- **Endpoint:** `POST /api/payments/initiate` via `useInitiatePayment()` mutation.
- **Request Payload:**
  ```typescript
  {
    services: string[],
    method: "MPESA" | "CARD",
    phone?: string, // Required for MPESA
    email?: string  // Required for CARD
  }
  ```
- **Note:** Payment amount is automatically calculated from the total of selected services by backend. No amount field required.
- **Response:** Payment initiation details including paymentId and checkoutRequestId (for MPESA) or authorizationUrl (for CARD).
- **Cache Invalidation:** Mutation invalidates `['payments']` query.

## Components Used
- React Router DOM: `Link`, `useNavigate` for routing.
- TanStack Query: `useInitiatePayment`, `useGetAllServices` hooks.
- Tailwind CSS classes: `label`, `input`, `input-select`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Validation:** Client-side validation for required fields (services, method, phone/email based on method).
- **Service Validation:** Ensure at least one service is selected.
- **Phone Validation:** Validate phone number format for MPESA (Kenyan format).
- **Email Validation:** Validate email format for CARD payments.
- **Submit Error:** Show inline `alert-error` with API error message if payment initiation fails.
- **Success State:** Navigate to payment status page with paymentId and checkoutId.

## Navigation Flow
- Route: `/payments/service`.
- **Cancel Button:** Navigate back to `/payments` (payment list).
- **Success:** After successful payment initiation, navigate to `/payments/status?paymentId=...&checkoutId=...` (payment status page).
- **Error:** Stay on service payment page, show error message.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits payment initiation.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!services.length) {
      setInlineMessage({ type: 'error', text: 'Please select at least one service.' });
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
      const result = await initiatePayment.mutateAsync({
        services,
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

- **`calculateTotalAmount`** — Computes total amount from selected services.
  ```tsx
  const totalAmount = useMemo(() => {
    if (!services.length) return 0;
    return services.reduce((sum, serviceId) => {
      const service = allServices.find(s => s._id === serviceId);
      return sum + (service?.fullPrice || 0);
    }, 0);
  }, [services, allServices]);
  ```

- **`canSubmit`** — Computes whether form can be submitted.
  ```tsx
  const canSubmit = useMemo(() => {
    if (!services.length || !method || isSubmitting) return false;
    if (method === 'MPESA') return Boolean(phone?.trim());
    if (method === 'CARD') return Boolean(email?.trim());
    return false;
  }, [services, method, phone, email, isSubmitting]);
  ```

## Implementation Details
- **Service Selection:** Multi-select or checkboxes for selecting services.
- **Total Amount Display:** Show calculated total amount from selected services.
- **Payment Method Selection:** Radio buttons or select dropdown for choosing payment method.
- **Conditional Fields:** Phone input shown only for MPESA, email input shown only for CARD.
- **Payment Status Navigation:** After successful payment initiation, navigate to payment status page to track payment.

## Future Enhancements
- Service search/filter in selection.
- Service quantity selection.
- Save payment method preference.
- Service bundles/packages.
