# Create Appointment Screen Documentation

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
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateAppointment } from '@/tanstack/useAppointments';
import { useGetAllServices, useGetServicesByStaff } from '@/tanstack/useServices';
import { useGetAllUsers, useGetStaffByService } from '@/tanstack/useUsers';
import { availabilityAPI } from '@/api';
import type { ITimeSlot } from '@/types/api.types';
```

## Context and State Management
- **Create Mutation:** `useCreateAppointment()` handles appointment creation with cache invalidation.
- **Service Queries:** 
  - `useGetAllServices({ status: 'active' })` - Fetches all active services
  - `useGetServicesByStaff(staffId)` - Fetches services for a specific staff member (staff-first flow)
- **Staff Queries:**
  - `useGetAllUsers({ role: 'staff', status: 'active' })` - Fetches all active staff
  - `useGetStaffByService(serviceId)` - Fetches staff who provide a specific service (service-first flow)
- **Availability API:** `availabilityAPI.getSlots()` - Fetches available time slots for staff, services, and date
- **Local State:**
  - `staffId` - Selected staff member ID (required)
  - `selectedServices` - Array of selected service IDs (required, min 1)
  - `selectedDate` - Selected date in YYYY-MM-DD format (required)
  - `selectedSlot` - Selected time slot with startTime and endTime (required)
  - `availableSlots` - Array of available slots fetched from API
  - `notes` - Optional notes for the appointment
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state
  - `isFetchingSlots` - Loading state for slot fetching
  - `selectionFlow` - Tracks whether user selected staff-first or service-first

## UI Structure
- **Header Card:** Title "Create Appointment" with description explaining the dual flow.
- **Form Card:** Two-column grid layout with form fields.
- **Form Fields:** 
  - staffId (select) - Shows all staff or filtered by selected service
  - services (multi-select checkboxes) - Shows all services or filtered by selected staff
  - date (date picker) - Date selection in YYYY-MM-DD format
  - "Check Available Slots" button - Fetches available time slots
  - Available slots grid - Displays selectable time slots
  - Selected slot display - Shows the chosen time slot
  - notes (textarea) - Optional notes
- **Actions:** Cancel button (navigate back), Create button (submit form).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Create Appointment                         │
│ Schedule a new appointment.                │
├────────────────────────────────────────────┤
│ Staff         │ Services                   │
│ Date          │ [Check Available Slots]    │
│ Available Slots (grid)                     │
│ Selected Slot (display)                    │
│ Notes         │ (textarea)                │
├────────────────────────────────────────────┤
│ [Cancel]  [Create Appointment]            │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Create Appointment                                │
│ Schedule a new appointment. Select staff or      │
│ services first, then choose a date and time slot. │
│                                                    │
│ Staff: [Jane Smith ▼]                            │
│        Showing staff who provide selected service │
│ Services: [☑ Haircut] [☑ Trim] [☐ Massage]      │
│          Showing services for selected staff       │
│ Date: [2025-01-25]                               │
│ [Check Available Slots]                           │
│                                                    │
│ Available Slots:                                  │
│ [09:00 AM - 09:50 AM] [10:00 AM - 10:50 AM]      │
│ [11:00 AM - 11:50 AM] [02:00 PM - 02:50 PM]      │
│                                                    │
│ Selected: 10:00 AM - 10:50 AM                    │
│                                                    │
│ Notes: [Optional notes...]                        │
│                                                    │
│ [Cancel]                    [Create Appointment]  │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Staff:** Select dropdown with available staff members, `input-select` class (required). Filters based on selected services in service-first flow.
- **Services:** Multi-select checkboxes with available services, `input-select` class (required, min 1). Filters based on selected staff in staff-first flow.
- **Date:** Date picker in YYYY-MM-DD format, `input` class (required). Minimum date is today.
- **Check Available Slots Button:** Button to fetch available time slots, `btn-secondary` class. Enabled when staff, services, and date are selected.
- **Available Slots:** Grid of selectable time slot buttons showing time ranges (e.g., "09:00 AM - 09:50 AM").
- **Selected Slot Display:** Shows the chosen time slot in a highlighted box.
- **Notes:** Textarea for optional notes, `input` class.

## API Integration

### Appointment Creation
- **Endpoint:** `POST /api/appointments` via `useCreateAppointment()` mutation.
- **Request Payload:**
  ```typescript
  {
    staffId: string,
    services: string[],
    startTime: string, // ISO 8601 format from selected slot
    endTime: string, // ISO 8601 format from selected slot
    notes?: string
  }
  ```
- **Note:** Customer is derived from authenticated user if not provided (admin can specify customerId).
- **Response:** Created appointment object with `_id`, status `PENDING`.
- **Cache Invalidation:** Mutation invalidates `['appointments']` query to refresh list.

### Slot Availability
- **Endpoint:** `GET /api/availability/slots` via `availabilityAPI.getSlots()`.
- **Query Parameters:**
  ```typescript
  {
    staffId: string,
    serviceId: string | string[], // Single service or array for multiple services
    date: string // YYYY-MM-DD format
  }
  ```
- **Response:**
  ```typescript
  {
    success: true,
    data: {
      slots: [
        {
          startTime: string, // ISO 8601 format
          endTime: string // ISO 8601 format
        }
      ]
    }
  }
  ```
- **Note:** When multiple services are selected, the API sums their durations and generates slots accordingly.

## Components Used
- React Router DOM: `Link`, `useNavigate` for routing.
- TanStack Query: `useCreateAppointment`, `useGetAllServices`, `useGetCustomers` hooks.
- Tailwind CSS classes: `label`, `input`, `input-select`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Validation:** Client-side validation for required fields (staffId, services, selectedDate, selectedSlot).
- **Slot Selection:** Ensure a slot is selected before allowing submission.
- **Service Validation:** Ensure at least one service is selected.
- **Date Validation:** Date must be today or in the future.
- **Slot Availability:** 
  - Backend validates slot availability (working hours, breaks, existing appointments).
  - If no slots available, display error message.
  - Handle API errors gracefully with user-friendly messages.
- **Submit Error:** Show inline `alert-error` with API error message if creation fails.
- **Success State:** Show `alert-success` message, then navigate to appointment details page.

## Navigation Flow
- Route: `/appointments/new`.
- **Cancel Button:** Navigate back to `/appointments` (appointment list).
- **Success:** After successful creation, navigate to `/appointments/:id` (newly created appointment's details page).
- **Error:** Stay on create page, show error message, keep form data.

## Functions Involved

### Selection Flow Management
- **`handleStaffChange`** — Handles staff selection and sets flow to staff-first.
  - Clears selected services, slot, and available slots when staff changes.
  - Sets `selectionFlow` to `'staff-first'`.

- **`handleServiceToggle`** — Handles service selection/deselection.
  - If first service selected and no staff, sets flow to `'service-first'`.
  - Clears slot selection when services change.

### Slot Fetching
- **`handleCheckSlots`** — Fetches available slots from API.
  ```tsx
  const handleCheckSlots = async () => {
    if (!staffId || selectedServices.length === 0 || !selectedDate) {
      setInlineMessage({ type: 'error', text: 'Please select staff, services, and date before checking slots.' });
      return;
    }
    setIsFetchingSlots(true);
    try {
      const serviceIds = selectedServices.length === 1 
        ? selectedServices[0] 
        : selectedServices;
      
      const response = await availabilityAPI.getSlots({
        staffId,
        serviceId: serviceIds,
        date: selectedDate,
      });
      
      if (response.data.success && response.data.data?.slots) {
        setAvailableSlots(response.data.data.slots);
        if (response.data.data.slots.length === 0) {
          setInlineMessage({ type: 'error', text: 'No available slots for the selected date.' });
        }
      }
    } catch (error) {
      setInlineMessage({ type: 'error', text: 'Failed to fetch available slots.' });
    } finally {
      setIsFetchingSlots(false);
    }
  };
  ```

- **`formatTime`** — Formats ISO date string to readable time format.
  ```tsx
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };
  ```

### Form Submission
- **`handleSubmit`** — Validates form and submits appointment creation.
  ```tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedSlot) return;
    
    setIsSubmitting(true);
    try {
      const result = await createAppointment.mutateAsync({
        staffId,
        services: selectedServices,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: notes.trim() || undefined,
      });
      setInlineMessage({ type: 'success', text: 'Appointment created successfully.' });
      setTimeout(() => navigate(`/appointments/${result._id}`), 1200);
    } catch (error) {
      setInlineMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to create appointment.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  ```

- **`canSubmit`** — Computes whether form can be submitted.
  ```tsx
  const canSubmit = useMemo(() => {
    return Boolean(
      staffId &&
      selectedServices.length > 0 &&
      selectedDate &&
      selectedSlot &&
      !isSubmitting
    );
  }, [staffId, selectedServices, selectedDate, selectedSlot, isSubmitting]);
  ```

- **`canCheckSlots`** — Computes whether slots can be fetched.
  ```tsx
  const canCheckSlots = useMemo(() => {
    return Boolean(staffId && selectedServices.length > 0 && selectedDate && !isFetchingSlots);
  }, [staffId, selectedServices, selectedDate, isFetchingSlots]);
  ```

## Selection Flows

### Staff-First Flow
1. User selects a staff member from the dropdown.
2. Services list filters to show only services assigned to that staff.
3. User selects one or more services.
4. User selects a date.
5. User clicks "Check Available Slots".
6. Available slots are displayed.
7. User selects a slot.
8. User submits the form.

### Service-First Flow
1. User selects one or more services from the list.
2. Staff list filters to show only staff who provide the selected service(s).
3. User selects a staff member.
4. User selects a date.
5. User clicks "Check Available Slots".
6. Available slots are displayed.
7. User selects a slot.
8. User submits the form.

## Future Enhancements
- Calendar view for date selection.
- Recurring appointment option.
- Appointment templates.
- Customer selection with search/filter (for admin).
- Real-time slot updates.
- Slot preview showing service details.
