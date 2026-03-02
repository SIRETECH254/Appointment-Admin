# Create Appointment Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Tabbed Navigation Flow](#tabbed-navigation-flow)
- [Planned Layout](#planned-layout)
- [Form Details by Tab](#form-details-by-tab)
- [API Integration](#api-integration)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)

## Imports
```tsx
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useCreateAppointment } from '../../../tanstack/useAppointments';
import { useGetAllServices } from '../../../tanstack/useServices';
import { useGetAllUsers } from '../../../tanstack/useUsers';
import { useGetSlots } from '../../../tanstack/useAvailability';
import { formatCurrency } from '../../../utils/paymentUtils';
import type { IUser, IService, ITimeSlot } from '../../../types/api.types';
```

## Context and State Management
- **TanStack Query:**
  - `useGetAllUsers({ role: 'staff', status: 'active' })` - Fetches all active staff members
  - `useGetAllServices({ status: 'active' })` - Fetches all active services
  - `useGetSlots()` - Fetches available time slots (only when `shouldFetchSlots` is true)
  - `useCreateAppointment()` - Mutation for creating appointment
- **Local State:**
  - `activeTab`: 'staff' | 'services' | 'slots' | 'summary'
  - `selectedStaff`: IUser object or null
  - `selectedServices`: Array of service IDs
  - `selectedDate`: Date object or null (starts as null, no auto-selection)
  - `selectedSlot`: ITimeSlot object (startTime, endTime) or null
  - `notes`: String
  - `shouldFetchSlots`: Boolean to control when slots are fetched (only after clicking "Check Availability")
  - `errorMessage`: String for tab-specific error messages

**`useCreateAppointment` hook (from `tanstack/useAppointments.ts`):**
```tsx
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData: CreateAppointmentPayload) => {
      const response = await appointmentAPI.create(appointmentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment created successfully');
    },
    onError: (error: any) => {
      console.error('Create appointment error:', error);
    },
  });
};
```

**`useGetSlots` hook (from `tanstack/useAvailability.ts`):**
```tsx
export const useGetSlots = (params: GetSlotsParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['slots', params],
    queryFn: async () => {
      const response = await availabilityAPI.getSlots(params);
      return response.data.data;
    },
    enabled: options?.enabled !== false && !!params.staffId && !!params.date,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

## UI Structure
- **Header:** Step indicator with numbered circles (1-4), progress bar, current step label, and "Step X of 4" in header right
- **Tabbed Navigation Flow:** Select Staff -> Select Services -> Slot Availability -> Summary
- **Loading States:** Skeleton loaders with `animate-pulse` for staff (5 cards) and services (5 cards)
- **Summary Cards:** Separate cards for each selection (Staff, Services, Date/Time, Price) with edit icons that navigate back to respective tabs
- **Error Display:** Tab-specific error messages displayed in red box below header, only shown when clicking "Next" without selection

## Tabbed Navigation Flow
The appointment creation follows a 4-step process:
1. **Staff Selection:** User selects a professional, services are auto-selected but user stays on tab
2. **Service Selection:** User can modify selected services, must click "Next" to proceed
3. **Slot Selection:** User selects date, clicks "Check Availability", then selects a time slot
4. **Summary:** Review all selections with edit capability, notes input, then book appointment

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Create Appointment                        │
│ Step 1 of 4                               │
├────────────────────────────────────────────┤
│ [1] Staff  [2] Services  [3] Slots  [4] Summary │
│ ────────────────────────                  │ (Progress Bar)
├────────────────────────────────────────────┤
│                                            │
│             TAB CONTENT AREA               │
│        (Scrollable form elements)          │
│                                            │
│                                            │
├────────────────────────────────────────────┤
│ [ < Previous ]                [ Next > ]   │ (Navigation)
└────────────────────────────────────────────┘
```

## Form Details by Tab

### Tab 1: Select Staff
- Grid of staff cards showing:
  - Avatar or initials
  - Full name
  - Role/display name
  - Services provided (first 3, with "+X more" if applicable)
- Selecting a staff member:
  - Auto-selects all services provided by that staff
  - Resets date, slot, and fetch flag
  - Does NOT automatically navigate to next tab

### Tab 2: Select Services
- List of service cards with checkboxes
- Each card shows:
  - Service name
  - Duration in minutes
  - Price (formatted currency)
- Services not provided by selected staff are disabled
- Total duration and estimated price displayed at bottom
- User can toggle services on/off

### Tab 3: Slot Availability
- Date input (HTML date picker, min=today)
- "Check Availability" button (disabled until date selected)
- After clicking button:
  - Shows loading spinner
  - Displays API message if available
  - Shows available time slots as clickable buttons
  - Empty state if no slots available
- Selected slot highlighted

### Tab 4: Summary
- **Staff Card:** Shows selected staff with avatar, name, role, and edit button
- **Services Card:** Lists all selected services with prices, and edit button
- **Date & Time Card:** Shows selected date and time slot, and edit button
- **Price Summary Card:** Shows total duration and total price
- **Notes Input:** Optional textarea for appointment notes
- **Book Button:** Creates appointment (replaces "Next" button)

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `appointmentAPI.create` and `availabilityAPI.getSlots`.
- **Slots Query Endpoint:** `GET /api/availability/slots` with query parameters.
- **Query Parameters:**
  - `staffId` - Required staff member ID
  - `serviceId` - Array of service IDs (single or multiple)
  - `date` - Date string in ISO format (YYYY-MM-DD)
- **Slots Response Structure:**
  ```json
  {
    "success": true,
    "data": {
      "slots": [
        {
          "startTime": "2026-02-01T09:00:00.000Z",
          "endTime": "2026-02-01T10:00:00.000Z",
          "available": true
        }
      ],
      "message": "Available slots retrieved successfully"
    }
  }
  ```
- **Create Mutation Endpoint:** `POST /api/appointments`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Create Payload:**
  ```json
  {
    "staffId": "...",
    "services": ["serviceId1", "serviceId2"],
    "startTime": "2026-02-01T09:00:00.000Z",
    "endTime": "2026-02-01T10:00:00.000Z",
    "notes": "Optional notes"
  }
  ```
- **Create Response Structure:**
  ```json
  {
    "success": true,
    "message": "Appointment created successfully",
    "data": {
      "appointment": {
        "_id": "...",
        "status": "PENDING",
        "bookingFeeAmount": 500,
        "remainingAmount": 1000
      }
    }
  }
  ```
- **Cache invalidation:** After successful creation, queries for `['appointments']` are invalidated.

## Error Handling

### Validation Functions

**`validateCurrentTab()`**
- Returns tab-specific error message string or null
- Validates current tab before allowing "Next" navigation
- Error messages:
  - Staff tab: "Please select a staff member."
  - Services tab: "Please select at least one service."
  - Slots tab: "Please select a date." / "Please click 'Check Availability' to see available slots." / "Please select a time slot."
  - Summary tab: Validates all required fields

**`validateTabNavigation()`**
- Returns boolean indicating if navigation to target tab is allowed
- Used for step indicator clicks (prevents navigation without showing errors)
- Does NOT set error messages (errors only show when clicking "Next")

### Error Display
- Error messages shown in red box below header
- Only displayed when clicking "Next" without valid selection
- Automatically cleared when valid selection is made on current tab
- Uses `errorMessage` state (string) instead of inline message object

### Error Clearing
- Errors automatically clear when:
  - Staff is selected (on staff tab)
  - At least one service is selected (on services tab)
  - A slot is selected (on slots tab)
- Errors also clear when navigating between tabs

## Navigation Flow
- **Next Button:** Validates current tab, shows error if invalid, otherwise navigates to next tab
- **Previous Button:** Navigates to previous tab and clears errors
- **Step Indicators:** Clickable circles that allow navigation to completed/valid tabs (no error display)
- **Edit Buttons (Summary):** Navigate back to respective tabs
- **Success:** Navigates to `/appointments/:id` after successful creation

## Functions Involved

### `handleStaffSelect(staff: IUser)`
Updates `selectedStaff` and automatically populates `selectedServices` with all services provided by that staff member. Note: Does NOT automatically navigate to next tab - user must click "Next" button.
```tsx
const handleStaffSelect = useCallback((staff: IUser) => {
  setSelectedStaff(staff);
  // Autoselect services provided by this staff
  const staffServices = (staff as any).services || [];
  const staffServiceIds = staffServices.map((s: any) => typeof s === 'string' ? s : s._id);
  setSelectedServices(staffServiceIds);
  setSelectedSlot(null); // Reset slot if staff changes
  setSelectedDate(null); // Reset date
  setShouldFetchSlots(false); // Reset fetch flag
  setErrorMessage('');
}, []);
```

### `toggleService(serviceId: string)`
Toggles service selection in the services array.
```tsx
const toggleService = useCallback((serviceId: string) => {
  setSelectedServices(prev => 
    prev.includes(serviceId) 
      ? prev.filter(id => id !== serviceId)
      : [...prev, serviceId]
  );
  setSelectedSlot(null); // Reset slot if services change
  setSelectedDate(null); // Reset date
  setShouldFetchSlots(false); // Reset fetch flag
}, []);
```

### `isServiceDisabled(serviceId: string)`
Logic to determine if a service should be disabled based on the selected staff's capabilities.
```tsx
const isServiceDisabled = useCallback((serviceId: string) => {
  if (!selectedStaff) return false;
  const staffServices = (selectedStaff as any).services || [];
  const staffServiceIds = staffServices.map((s: any) => typeof s === 'string' ? s : s._id);
  return !staffServiceIds.includes(serviceId);
}, [selectedStaff]);
```

### `calculateTotals()`
Computes the total price and duration for the summary tab.
```tsx
const totals = useMemo(() => {
  return selectedServices.reduce((acc, id) => {
    const service = allServices.find(s => s._id === id);
    return {
      price: acc.price + (service?.fullPrice || 0),
      duration: acc.duration + (service?.duration || 0)
    };
  }, { price: 0, duration: 0 });
}, [selectedServices, allServices]);
```

### `handleDateChange(dateString: string)`
Updates `selectedDate` and resets the selected slot and fetch flag. Does NOT automatically fetch slots.
```tsx
const handleDateChange = useCallback((dateString: string) => {
  const date = new Date(dateString);
  setSelectedDate(date);
  setSelectedSlot(null);
  setShouldFetchSlots(false); // Reset fetch flag when date changes
}, []);
```

### `handleCheckAvailability()`
Manually triggers slot fetching when user clicks "Check Availability" button. Slots are NOT automatically fetched when date is selected.
```tsx
const handleCheckAvailability = useCallback(() => {
  if (!selectedDate) {
    setErrorMessage('Please select a date first.');
    return;
  }
  setShouldFetchSlots(true);
  setSelectedSlot(null); // Reset selected slot
  refetchSlots();
}, [selectedDate, refetchSlots]);
```

### `handleBooking()`
Triggers the `useCreateAppointment` mutation with validation and navigation.
```tsx
const handleBooking = async () => {
  if (!selectedStaff || selectedServices.length === 0 || !selectedSlot) {
    setErrorMessage('Please complete all steps before booking.');
    return;
  }

  try {
    const result = await createMutation.mutateAsync({
      staffId: selectedStaff._id,
      services: selectedServices,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes: notes.trim() || undefined,
    });
    navigate(`/appointments/${(result as any)._id}`);
  } catch (error: any) {
    setErrorMessage(error?.response?.data?.message || 'Failed to create appointment.');
  }
};
```

### `handleTabChange(tab: BookingTab)`
Handles tab navigation from step indicator clicks. Only allows navigation if validation passes, doesn't show errors.
```tsx
const handleTabChange = useCallback((tab: BookingTab) => {
  // Only allow navigation if validation passes
  // Don't show errors here - errors only show when clicking "Next"
  if (!validateTabNavigation(tab)) {
    return;
  }
  setActiveTab(tab);
  setErrorMessage(''); // Clear any existing errors when navigating
}, [validateTabNavigation]);
```

### `renderStepHeader()`
Renders the header section with:
- Current step indicator (numbered circle with step number)
- Current step label
- Step numbers with checkmarks for completed steps
- Progress bar showing completion percentage
```tsx
const renderStepHeader = () => {
  const progress = (currentStep / TABS.length) * 100;
  // Returns JSX with step indicators and progress bar
};
```

## Implementation Notes
- All tab content is rendered inline within a single file (`AppointmentAddTabs.tsx`)
- No separate step component files are used
- Error handling follows client-side pattern with tab-specific validation
- Slots are only fetched after user clicks "Check Availability" button
- Date is stored as Date object internally, converted to string for API calls
- Staff is stored as IUser object, not just ID string
- Uses `date-fns` for date formatting
- Uses `formatCurrency` utility for price display
