# Appointment List Screen Documentation

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
import { useGetAllAppointments } from '../../../tanstack/useAppointments';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import Pagination from '../../../components/ui/Pagination';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatAppointmentDateTime, getAppointmentCustomerName, getAppointmentStaffName } from '../../../utils/appointmentUtils';
import { formatCurrency } from '../../../utils/paymentUtils';
import type { IAppointment } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetAllAppointments(params)` fetches paginated appointment list with filters and search.
- **Local State:**
  - `searchTerm` - Current search input value
  - `debouncedSearch` - Debounced search value (500ms delay)
  - `filterStatus` - Selected status filter (all/pending/confirmed/completed/cancelled/no_show)
  - `filterStaffId` - Selected staff member filter (all or specific staff ID)
  - `startDate` - Start date filter (optional)
  - `endDate` - End date filter (optional)
  - `currentPage` - Current page number (default: 1)
  - `itemsPerPage` - Items per page (default: 10)
- **Derived State:** `params` memo combines filters, search, and pagination for API call.

## UI Structure
- **Toolbar:** Search input with search icon, status filter dropdown, staff filter dropdown, items per page selector, "Add Appointment" button.
- **Table:** Uses `table-container`, `table`, `table-header`, `table-body`, `table-row`, `table-cell` classes. Header row with columns (Customer, Staff, Services, Date/Time, Status, Amount, Actions). Uses `StatusBadge` component for status display. Data rows, loading skeleton rows, error/empty states. Horizontal scroll enabled when content overflows.
- **Pagination:** Component at bottom showing current page, total pages, and navigation controls.

## Planned Layout
```
┌────────────────────────────────────────────────────────────────────┐
│ [Search] [Status] [Staff] [Start Date] [End Date] [Items/Page] [+Add]│
├────────────────────────────────────────────────────────────────────┤
│ Customer │ Staff │ Services │ Date/Time │ Status │ Amount │ Actions│
├────────────────────────────────────────────────────────────────────┤
│ John Doe │ Jane  │ Haircut  │ Jan 25, 9am│Pending│ KES 500│ [View]│
│ ...                                                                 │
├────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50              [Prev] [Next]       │
└────────────────────────────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search... [Status: All ▼] [Staff: All ▼] [From: __] [To: __] [10 ▼] │
│                                                              [+ Appointment]│
├──────────────────────────────────────────────────────────────────────────┤
│ Customer │ Staff │ Services      │ Date/Time      │ Status │ Amount │ Act│
├──────────────────────────────────────────────────────────────────────────┤
│ John Doe │ Jane  │ Haircut, Trim │ Jan 25, 9:00AM│ Pending │ KES 500│ 👁│
│ Mary S.  │ Bob   │ Massage       │ Jan 26, 2:00PM│ Confirm │ KES 800│ 👁│
│ ...                                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ Page 1 of 5 • Showing 1–10 of 50                    [← Prev] [Next →]   │
└──────────────────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Text input with debounce (500ms) using `input-search` class. Searches by customer name or email.
- **Status Filter:** Select dropdown with options: All, Pending, Confirmed, Completed, Cancelled, No Show.
- **Staff Filter:** Select dropdown with options: All, and list of staff members (fetched from users with staff role).
- **Start Date:** Date input for filtering appointments from a specific date.
- **End Date:** Date input for filtering appointments until a specific date.
- **Items Per Page:** Select dropdown with options: 10, 25, 50, 100.
- **Add Appointment Button:** Primary button linking to `/appointments/new`.

## API Integration
- **Endpoint:** `GET /api/appointments` with query parameters (page, limit, search, status, staffId, startDate, endDate).
- **Hook:** `useGetAllAppointments(params)` returns paginated appointment data.
- **Response Structure:**
  ```typescript
  {
    appointments: IAppointment[],
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
- React Icons: `MdVisibility`, `MdAdd`, `FiSearch`, `FiFilter`, `FiList` for action buttons and icons.
- TanStack Query: `useGetAllAppointments`, `useGetAllUsers` hooks.
- Custom Components: `Pagination` component for pagination controls, `StatusBadge` component for status display.
- Utility Functions: `formatAppointmentDateTime`, `getAppointmentCustomerName`, `getAppointmentStaffName` from `../../../utils/appointmentUtils`, `formatCurrency` from `../../../utils/paymentUtils`.
- Tailwind CSS classes: `input-search`, `btn-primary`, `btn-ghost`, `btn-sm`, `table-container`, `table`, `table-header`, `table-body`, `table-row`, `table-cell`, `alert-error`.

## Error Handling
- **Loading State:** Display 5 skeleton rows with `animate-pulse` effect in table body.
- **Error State:** Show inline `alert-error` with API error message from `error.response?.data?.message`.
- **Empty State:** Display "No appointments found" message when `appointments.length === 0`.
- **Network Errors:** Gracefully handle network failures with user-friendly messages.

## Navigation Flow
- Route: `/appointments`.
- **View Action:** Navigate to `/appointments/:id` (AppointmentDetails page) using icon button with `MdVisibility` icon.
- **Add Appointment Button:** Navigate to `/appointments/new` (AppointmentAdd page) with `MdAdd` icon.

## Functions Involved
- **`formatAppointmentDateTime`** — Formats appointment date and time for display (from `../../../utils/appointmentUtils`).
- **`getAppointmentCustomerName`** — Gets customer name from appointment (from `../../../utils/appointmentUtils`).
- **`getAppointmentStaffName`** — Gets staff name from appointment (from `../../../utils/appointmentUtils`).
- **`formatCurrency`** — Formats currency amounts for display (from `../../../utils/paymentUtils`).

- **`formatAppointmentStatus`** — Formats appointment status for display (from `@/utils/appointmentUtils`).
  ```tsx
  import { formatAppointmentStatus } from '@/utils/appointmentUtils';
  // Usage: formatAppointmentStatus(appointment.status)
  ```

- **`getAppointmentStatusVariant`** — Gets badge variant for appointment status (from `@/utils/appointmentUtils`).
  ```tsx
  import { getAppointmentStatusVariant } from '@/utils/appointmentUtils';
  // Usage: getAppointmentStatusVariant(appointment.status)
  ```

- **`formatCurrency`** — Formats currency amount for display (from `@/utils/paymentUtils`).
  ```tsx
  import { formatCurrency } from '@/utils/paymentUtils';
  // Usage: formatCurrency(appointment.bookingFeeAmount, 'KES')
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
- **Status Badges:** Use color-coded badges to indicate appointment status (pending, confirmed, completed, etc.).
- **Service Display:** Show comma-separated list of service names, or "N services" if multiple.

## Future Enhancements
- Bulk actions (cancel multiple appointments, export to CSV).
- Column sorting (by date, customer, staff, status).
- Calendar view option.
- Advanced filters (customer, service type, payment status).
- Appointment statistics dashboard integration.
