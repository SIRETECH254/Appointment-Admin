# Payment List Screen Documentation

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
import { Link } from 'react-router-dom';
import { MdVisibility, MdAdd } from 'react-icons/md';
import { useGetAllPayments } from '@/tanstack/usePayments';
import Pagination from '@/components/ui/Pagination';
import { formatPaymentStatus, getPaymentStatusVariant, formatPaymentMethod, formatPaymentType } from '@/utils/paymentUtils';
import { formatDateTime } from '@/utils';
import type { IPayment } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetAllPayments(params)` fetches paginated payment list with filters and search.
- **Local State:**
  - `searchTerm` - Current search input value
  - `debouncedSearch` - Debounced search value (500ms delay)
  - `filterStatus` - Selected status filter (all/pending/success/failed)
  - `filterMethod` - Selected payment method filter (all/mpesa/card/cash)
  - `filterType` - Selected payment type filter (all/booking_fee/full_payment)
  - `startDate` - Start date filter (optional)
  - `endDate` - End date filter (optional)
  - `currentPage` - Current page number (default: 1)
  - `itemsPerPage` - Items per page (default: 10)
- **Derived State:** `params` memo combines filters, search, and pagination for API call.

## UI Structure
- **Toolbar:** Search input, status filter dropdown, method filter dropdown, type filter dropdown, date range pickers, items per page selector, "Service Payment" button.
- **Table:** HTML `<table>` element with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags. Header row with columns (Payment Number, Customer, Amount, Method, Type, Status, Date, Actions), data rows, loading skeleton rows, error/empty states. Horizontal scroll enabled when content overflows.
- **Pagination:** Component at bottom showing current page, total pages, and navigation controls.

## Planned Layout
```
┌────────────────────────────────────────────────────────────────────┐
│ [Search] [Status] [Method] [Type] [Start Date] [End Date] [Items]│
│ [+ Service Payment]                                              │
├────────────────────────────────────────────────────────────────────┤
│ Payment # │ Customer │ Amount │ Method │ Type │ Status │ Date │ Act│
├────────────────────────────────────────────────────────────────────┤
│ PAY-2025-0001│John Doe│KES 200│M-Pesa │Booking│Success│Jan 25│[V]│
│ ...                                                                 │
├────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50              [Prev] [Next]      │
└────────────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search... [Status: All ▼] [Method: All ▼] [Type: All ▼] [From: __]  │
│ [To: __] [10 ▼]                                          [+ Service Pay]│
├──────────────────────────────────────────────────────────────────────────┤
│ Payment # │ Customer │ Amount │ Method │ Type │ Status │ Date │ Actions  │
├──────────────────────────────────────────────────────────────────────────┤
│ PAY-2025-0001│John Doe│KES 200│M-Pesa │Booking│Success│Jan 25│ 👁       │
│ PAY-2025-0002│Mary S. │KES 800│Card   │Full   │Pending│Jan 26│ 👁       │
│ ...                                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50                    [← Prev] [Next →]   │
└──────────────────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Text input with debounce (500ms) using `input-search` class. Searches by payment number or customer name/email.
- **Status Filter:** Select dropdown with options: All, Pending, Success, Failed.
- **Method Filter:** Select dropdown with options: All, M-Pesa, Card, Cash.
- **Type Filter:** Select dropdown with options: All, Booking Fee, Full Payment.
- **Start Date:** Date input for filtering payments from a specific date.
- **End Date:** Date input for filtering payments until a specific date.
- **Items Per Page:** Select dropdown with options: 10, 25, 50, 100.
- **Service Payment Button:** Primary button linking to `/payments/service`.

## API Integration
- **Endpoint:** `GET /api/payments` with query parameters (page, limit, search, status, method, type, startDate, endDate).
- **Hook:** `useGetAllPayments(params)` returns paginated payment data.
- **Response Structure:**
  ```typescript
  {
    payments: IPayment[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
  ```
- **Access:** Admin/Staff only (enforced by backend).

## Components Used
- React Router DOM: `Link` for navigation.
- React Icons: `MdVisibility`, `MdAdd` for action buttons.
- TanStack Query: `useGetAllPayments` hook.
- Custom Components: `Pagination` component for pagination controls.
- Utility Functions: `formatPaymentStatus`, `getPaymentStatusVariant`, `formatPaymentMethod`, `formatPaymentType` from `@/utils/paymentUtils`, `formatDateTime` from `@/utils`.
- Tailwind CSS classes: `input-search`, `btn-primary`, `btn-ghost`, `btn-sm`, `badge`, `badge-success`, `badge-error`, `badge-soft`, `alert-error`.

## Error Handling
- **Loading State:** Display 5 skeleton rows with `animate-pulse` effect in table body.
- **Error State:** Show inline `alert-error` with API error message from `error.response?.data?.message`.
- **Empty State:** Display "No payments found" message when `payments.length === 0`.
- **Network Errors:** Gracefully handle network failures with user-friendly messages.

## Navigation Flow
- Route: `/payments`.
- **View Action:** Navigate to `/payments/:id` (PaymentDetails page) using icon button with `MdVisibility` icon.
- **Service Payment Button:** Navigate to `/payments/service` (ServicePayment page) with `MdAdd` icon.

## Functions Involved
- **`formatPaymentStatus`** — Formats payment status for display (from `@/utils/paymentUtils`).
  ```tsx
  import { formatPaymentStatus } from '@/utils/paymentUtils';
  // Usage: formatPaymentStatus(payment.status)
  ```

- **`getPaymentStatusVariant`** — Gets badge variant for payment status (from `@/utils/paymentUtils`).
  ```tsx
  import { getPaymentStatusVariant } from '@/utils/paymentUtils';
  // Usage: getPaymentStatusVariant(payment.status)
  ```

- **`formatPaymentMethod`** — Formats payment method for display (from `@/utils/paymentUtils`).
  ```tsx
  import { formatPaymentMethod } from '@/utils/paymentUtils';
  // Usage: formatPaymentMethod(payment.method)
  ```

- **`formatPaymentType`** — Formats payment type for display (from `@/utils/paymentUtils`).
  ```tsx
  import { formatPaymentType } from '@/utils/paymentUtils';
  // Usage: formatPaymentType(payment.type)
  ```

- **`formatCurrency`** — Formats currency amount for display (from `@/utils/paymentUtils`).
  ```tsx
  import { formatCurrency } from '@/utils/paymentUtils';
  // Usage: formatCurrency(payment.amount, payment.currency || 'KES')
  ```

- **`debounceSearch`** — Debounces search input to reduce API calls.
  ```tsx
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  ```

## Implementation Details
- **Table Structure:** Uses semantic HTML `<table>` elements with proper `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags for accessibility.
- **Horizontal Scroll:** Table container has `overflow-x-auto` class with `min-w-[1000px]` on table to enable horizontal scrolling when content overflows on smaller screens.
- **Icons:** Action buttons use Material Design icons (`MdVisibility`) for visual clarity.
- **Utility Functions:** Reusable functions are imported from utility files for consistency across components.
- **Status Badges:** Use color-coded badges to indicate payment status (pending, success, failed).
- **Payment Number:** Display formatted payment number (e.g., PAY-2025-0001).

## Future Enhancements
- Bulk actions (export to CSV/Excel).
- Column sorting (by date, amount, status).
- Payment statistics dashboard integration.
- Refund functionality.
- Payment method analytics.
