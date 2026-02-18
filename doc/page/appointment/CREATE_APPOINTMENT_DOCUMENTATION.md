# Create Appointment Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Tabbed Navigation Flow](#tabbed-navigation-flow)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs by Tab](#form-inputs-by-tab)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)

## Imports
```tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateAppointment } from '../../../tanstack/useAppointments';
import { useGetAllServices } from '../../../tanstack/useServices';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import { useGetSlots } from '../../../tanstack/useAvailability';
import type { ITimeSlot } from '../../../types/api.types';
import { APPOINTMENT_TABS } from '../../../constants/appointmentTabs';
```

## Context and State Management
- **Create Mutation:** `useCreateAppointment()` handles appointment creation.
- **Service Queries:** `useGetAllServices({ status: 'active' })` fetches all active services.
- **Staff Queries:** `useGetAllUsers({ role: 'staff', status: 'active' })` fetches all active staff.
- **Slots Query:** `useGetSlots(params)` fetches available time slots using TanStack Query.
- **Local State:**
  - `staffId`: Selected staff member ID.
  - `selectedServices`: Array of selected service IDs.
  - `selectedDate`: Selected date (YYYY-MM-DD).
  - `selectedSlot`: Selected time slot object.
  - `notes`: Optional appointment notes.
  - `activeTabId`: Currently active tab ID.
  - `inlineMessage`: Success/error feedback messages.
  - `isSubmitting`: Submission state.

## UI Structure
- **Header:** Page title and description.
- **Progress Stepper:** Visual indicator of current step (Staff -> Services -> Date & Time -> Notes -> Summary).
- **Tab Content:** Dynamic area rendering the component for the active step.
- **Action Footer:** Navigation buttons (Previous, Next, or Create Appointment).

## Tabbed Navigation Flow
1. **Staff:** Choose a staff member. Selecting a staff member auto-selects all services they provide by default.
2. **Services:** Refine service selection. Only services provided by the selected staff can be chosen.
3. **Date & Time:** Select a date and fetch available time slots. Select a specific slot.
4. **Notes:** Optional field for additional information.
5. **Summary:** Review all selections. Each section has an "Edit" button that navigates back to the respective tab.

## Planned Layout
```
┌──────────────────────────────────────────────────────────┐
│ Create Appointment                                       │
│ [ (1) Staff ]──[ (2) Services ]──[ (3) Date ]──[ (4) Summary ] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                 [ Active Tab Content ]                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [ Previous ]                           [ Next / Create ] │
└──────────────────────────────────────────────────────────┘
```

## Sketch Wireframe

### Step 1: Staff Selection
```
┌────────────────────────────────────────────────────┐
│ Create Appointment                                │
│ (1) Staff  -- (2) Services -- (3) Date -- (4) Sum. │
├────────────────────────────────────────────────────┤
│ Select Staff                                      │
│                                                   │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────┐ │
│ │ [👤] Jane S.  │ │ [👤] John D.  │ │ ...       │ │
│ │ Services: 2   │ │ Services: 3   │ │           │ │
│ └───────────────┘ └───────────────┘ └───────────┘ │
│                                                   │
│                                         [ Next ]  │
└────────────────────────────────────────────────────┘
```

### Step 3: Date & Time Selection
```
┌────────────────────────────────────────────────────┐
│ Create Appointment                                │
│ (1) Staff  -- (2) Services -- (3) Date -- (4) Sum. │
├────────────────────────────────────────────────────┤
│ Select Date & Time                                │
│                                                   │
│ Date: [ 2026-02-18 ]                              │
│ [ Check Available Slots ]                         │
│                                                   │
│ Available Slots:                                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ 09:00 AM│ │ 10:00 AM│ │ 11:00 AM│ │ ...     │   │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                   │
│ Selected: 10:00 AM - 10:45 AM                     │
│                                                   │
│ [ Previous ]                            [ Next ]  │
└────────────────────────────────────────────────────┘
```

### Step 5: Summary
```
┌────────────────────────────────────────────────────┐
│ Create Appointment                                │
│ (1) Staff  -- (2) Services -- (3) Date -- (4) Sum. │
├────────────────────────────────────────────────────┤
│ Appointment Summary                               │
│                                                   │
│ ┌──────────────────┐ ┌──────────────────────────┐ │
│ │ Staff [Edit]     │ │ Services [Edit]          │ │
│ │ Jane Smith       │ │ • Haircut                │ │
│ └──────────────────┘ └──────────────────────────┘ │
│ ┌──────────────────┐ ┌──────────────────────────┐ │
│ │ Date & Time [Ed] │ │ Notes [Edit]             │ │
│ │ Feb 18, 2026     │ │ No notes provided        │ │
│ │ 10:00 - 10:45 AM │ │                          │ │
│ └──────────────────┘ └──────────────────────────┘ │
│                                                   │
│ [ Previous ]                [ Create Appointment ] │
└────────────────────────────────────────────────────┘
```

## Form Inputs by Tab
- **Staff Tab:** Grid of staff cards. Each card shows name, roles, services provided, and working hours for the selected date.
- **Services Tab:** Grid of service cards with checkboxes. Services not provided by the selected staff are disabled.
- **Date & Time Tab:**
  - Date input (`type="date"`, min=today).
  - "Check Available Slots" button.
  - Grid of time slot buttons.
- **Notes Tab:** Textarea for optional notes.
- **Summary Tab:** Non-interactive review cards with edit shortcuts.

## API Integration

### Appointment Creation
- **Endpoint:** `POST /api/appointments` via `useCreateAppointment()`.
- **Payload:**
  ```typescript
  {
    staffId: string,
    services: string[],
    startTime: string, // ISO format
    endTime: string,   // ISO format
    notes?: string
  }
  ```

### Slot Availability
- **Endpoint:** `GET /api/availability/slots` via `useGetSlots()`.
- **Parameters:** `staffId`, `serviceId` (array of IDs), `date`.

## Error Handling
- **Inline Messages:** Displays success/error alerts within the form container.
- **Validation:**
  - "Next" navigation depends on local validation (e.g., must select staff before moving to services).
  - "Create Appointment" button disabled until all required fields (staff, services, date, slot) are present.
- **Slot Availability:** Shows specific error if no slots are returned for the selected combination.

## Navigation Flow
- **Next/Previous:** Manages `activeTabId` based on `APPOINTMENT_TABS` constant.
- **Edit in Summary:** Sets `activeTabId` to the specific step ID.
- **Success:** Navigates to `/appointments/:id` after successful creation.

## Functions Involved
- `handleStaffChange`: Updates `staffId` and auto-populates `selectedServices` based on staff capability.
- `handleServiceToggle`: Manages multiple service selection.
- `handleCheckSlots`: Triggers the TanStack Query to fetch availability.
- `handleSubmit`: Orchestrates the final API call.
- `goToNextTab` / `goToPreviousTab`: Utility functions for step-based navigation.
