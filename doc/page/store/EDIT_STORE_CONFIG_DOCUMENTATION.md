# Edit Store Configuration Screen Documentation

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

import { useGetStoreConfiguration, useUpdateStoreConfiguration } from '@/tanstack/useStoreConfig';
```

## Context and State Management
- **TanStack Query:**
  - `useGetStoreConfiguration()` fetches the latest store configuration data.
  - `useUpdateStoreConfiguration()` submits configuration changes.
- **Local form state:** `appointmentFeeType`, `appointmentFeeValue`, `currency`, `minBookingNotice`, `lateGracePeriod`, `allowWalkIns`, `notificationSettings`, `businessHoursTimezone`.
- **Reminder times:** managed as comma-separated string in form, converted to array on submit.

## UI Structure
- **Header:** title and guidance text.
- **Form sections:** appointment fee, booking settings, notification settings, business settings.
- **Actions:** cancel + save changes; inline success/error messaging.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Edit Store Configuration                  │
│ Update your store settings and policies   │
├────────────────────────────────────────────┤
│ Appointment Fee Type   Fee Value          │
│ Currency (read-only)                      │
│ Min Booking Notice   Late Grace Period    │
│ Allow Walk-ins (checkbox)                 │
├────────────────────────────────────────────┤
│ Send SMS (checkbox)   Send Email (checkbox)│
│ Send Push (checkbox)                      │
│ Reminder Times (comma-separated)          │
├────────────────────────────────────────────┤
│ Timezone (read-only)                      │
├────────────────────────────────────────────┤
│ Inline success / error                    │
│ [Cancel]  [Save changes]                  │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Edit Store Configuration                          │
│ Update your store settings and policies           │
│                                                    │
│ Appointment Fee Type: [FIXED ▼]                   │
│ Appointment Fee Value: [200]                      │
│ Currency: [KES] (disabled)                        │
│                                                    │
│ Min Booking Notice (minutes): [60]                │
│ Late Grace Period (minutes): [10]                 │
│ ☑ Allow Walk-ins                                  │
│                                                    │
│ ☑ Send SMS          ☑ Send Email                  │
│ ☐ Send Push                                        │
│ Reminder Times (comma-separated): [1440, 120, 30]  │
│                                                    │
│ Timezone: [Africa/Nairobi] (disabled)            │
│                                                    │
│ [Cancel]  [Save changes]                           │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Appointment fee type**
  ```tsx
  <select
    value={appointmentFeeType}
    onChange={(event) => setAppointmentFeeType(event.target.value as 'FIXED' | 'PERCENTAGE')}
    className="input"
  >
    <option value="FIXED">FIXED</option>
    <option value="PERCENTAGE">PERCENTAGE</option>
  </select>
  ```

- **Appointment fee value**
  ```tsx
  <input
    type="number"
    value={appointmentFeeValue}
    onChange={(event) => setAppointmentFeeValue(Number(event.target.value))}
    min="0"
    className="input"
  />
  ```

- **Currency (disabled)**
  ```tsx
  <input value={currency} disabled className="input-disabled" />
  ```

- **Min booking notice**
  ```tsx
  <input
    type="number"
    value={minBookingNotice}
    onChange={(event) => setMinBookingNotice(Number(event.target.value))}
    min="0"
    className="input"
  />
  ```

- **Allow walk-ins (checkbox)**
  ```tsx
  <input
    type="checkbox"
    checked={allowWalkIns}
    onChange={(event) => setAllowWalkIns(event.target.checked)}
    className="form-checkbox"
  />
  ```

- **Notification settings (checkboxes)**
  ```tsx
  <input
    type="checkbox"
    checked={notificationSettings.sendSMS}
    onChange={(event) => setNotificationSettings({ ...notificationSettings, sendSMS: event.target.checked })}
    className="form-checkbox"
  />
  ```

- **Reminder times (comma-separated input)**
  ```tsx
  <input
    value={reminderTimesInput}
    onChange={(event) => setReminderTimesInput(event.target.value)}
    placeholder="1440, 120, 30"
    className="input"
  />
  ```

## API Integration
- **Endpoint:** `PUT /api/store-configuration`.
- **Payload:** JSON body with partial configuration updates.
- **Hook:** `useUpdateStoreConfiguration()` handles the mutation and returns updated configuration data.
- **Response structure:** `response.data.data.storeConfiguration`.

## Components Used
- React + React Router DOM: `Link`, `useNavigate`.
- Tailwind CSS utilities: `input`, `input-disabled`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`, `auth-field`, `label`, `form-checkbox`.

## Error Handling
- Local validation for required fields and numeric constraints.
- API errors surface via `error.response?.data?.message` fallback.
- Inline feedback beneath the form.
- Validate reminder times array parsing.

## Navigation Flow
- Route: `/store/edit`.
- `Cancel` ➞ `/store`.
- On successful update, navigate back to `/store` (with 1.2s delay).

## Functions Involved
- **`parseReminderTimes`** — parses comma-separated string to number array.
  ```tsx
  const parseReminderTimes = (input: string): number[] => {
    if (!input.trim()) return [];
    return input
      .split(',')
      .map(item => Number(item.trim()))
      .filter(num => !Number.isNaN(num) && num >= 0);
  };
  ```

- **`handleSubmit`** — validates and submits configuration updates.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validate reminder times
    const reminderTimes = parseReminderTimes(reminderTimesInput);
    if (reminderTimes.length === 0 && reminderTimesInput.trim()) {
      setInlineMessage({ type: 'error', text: 'Invalid reminder times format.' });
      return;
    }
    
    const payload = {
      appointmentFeeType,
      appointmentFeeValue,
      currency,
      minBookingNotice,
      lateGracePeriod,
      allowWalkIns,
      notificationSettings: {
        ...notificationSettings,
        reminderTimes,
      },
      businessHoursTimezone,
    };
    
    await updateStoreConfiguration.mutateAsync(payload);
  };
  ```

## Future Enhancements
- Add validation for business hours if implemented.
- Add preview of how changes affect existing appointments.
- Support bulk configuration updates.
- Add configuration templates/presets.

