# Payment Details Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetPaymentById } from '@/tanstack/usePayments';
import { formatPaymentStatus, getPaymentStatusVariant, formatPaymentMethod, formatPaymentType, formatCurrency } from '@/utils/paymentUtils';
import { formatDateTimeWithTime } from '@/utils';
import type { IPayment } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/payments/:id`).
- **TanStack Query:** `useGetPaymentById(id)` fetches payment data.
- **Derived State:** Payment information extracted from API response.

## UI Structure
- **Header Card:** Payment number, status badge, amount, and payment method.
- **Details Card:** Payment information (customer, type, date, transaction references).
- **Appointment Link:** Link to related appointment if payment is for an appointment.
- **Transaction References:** Display processor references (M-Pesa checkout ID, Paystack reference).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Payment Details                            │
│ Payment #: PAY-2025-0001                   │
│ Status: [Success]                          │
│ Amount: KES 200                            │
├────────────────────────────────────────────┤
│ Customer: John Doe                        │
│ Method: M-Pesa                            │
│ Type: Booking Fee                         │
│ Date: Jan 25, 2025 10:30 AM              │
│ Transaction Ref: ...                      │
├────────────────────────────────────────────┤
│ [View Appointment] [Back to Payments]     │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│ Payment #PAY-2025-0001                                     │
│ Status: [Success]                                          │
│                                                            │
│ Amount: KES 200                                            │
│ Method: M-Pesa                                             │
│ Type: Booking Fee                                          │
│                                                            │
│ Payment Details:                                           │
│ • Customer: John Doe (john@example.com)                   │
│ • Payment Date: January 25, 2025, 10:30 AM                │
│ • Transaction Reference: ws_CO_25012025103000             │
│ • M-Pesa Checkout ID: abc123...                          │
│                                                            │
│ Related Appointment:                                       │
│ • Appointment #APT-2025-0001                             │
│ • Date: January 25, 2025, 9:00 AM                        │
│ [View Appointment]                                        │
│                                                            │
│ [Back to Payments]                                        │
└────────────────────────────────────────────────────────────┘
```

## API Integration
- **Get Endpoint:** `GET /api/payments/:paymentId` via `useGetPaymentById(paymentId)`.
- **Response:** Payment object with populated customer and appointment (if exists).
- **Response Structure:**
  ```typescript
  {
    payment: IPayment
  }
  ```

## Components Used
- React Router DOM: `Link`, `useParams` for routing.
- TanStack Query: `useGetPaymentById` hook.
- Utility Functions: `formatPaymentStatus`, `getPaymentStatusVariant`, `formatPaymentMethod`, `formatPaymentType`, `formatCurrency` from `@/utils/paymentUtils`, `formatDateTimeWithTime` from `@/utils`.
- Tailwind CSS classes: `btn-primary`, `btn-secondary`, `badge`, `badge-success`, `badge-error`, `badge-soft`, `alert-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching payment data.
- **Error State:** Display `alert-error` with API error message if fetch fails.
- **No Payment Found:** Display error message and link back to payment list.

## Navigation Flow
- Route: `/payments/:id`.
- **View Appointment Button:** Navigate to `/appointments/:appointmentId` if payment has related appointment.
- **Back Button:** Navigate to `/payments` (payment list).

## Functions Involved
- **`formatPaymentStatus`** — Formats payment status for display.
  ```tsx
  import { formatPaymentStatus } from '@/utils/paymentUtils';
  // Usage: formatPaymentStatus(payment.status)
  ```

- **`formatPaymentMethod`** — Formats payment method for display.
  ```tsx
  import { formatPaymentMethod } from '@/utils/paymentUtils';
  // Usage: formatPaymentMethod(payment.method)
  ```

- **`formatPaymentType`** — Formats payment type for display.
  ```tsx
  import { formatPaymentType } from '@/utils/paymentUtils';
  // Usage: formatPaymentType(payment.type)
  ```

- **`formatCurrency`** — Formats currency amount for display.
  ```tsx
  import { formatCurrency } from '@/utils/paymentUtils';
  // Usage: formatCurrency(payment.amount, payment.currency || 'KES')
  ```

## Implementation Details
- **Status Badge:** Display payment status with color-coded badge.
- **Transaction References:** Display processor-specific references (M-Pesa checkout ID, Paystack reference).
- **Appointment Link:** Show link to related appointment if payment.appointmentId exists.
- **Payment Information:** Display all payment details in organized sections.

## Future Enhancements
- Payment receipt download/print.
- Refund information and history.
- Payment timeline/status history.
- Related payments for the same appointment.
