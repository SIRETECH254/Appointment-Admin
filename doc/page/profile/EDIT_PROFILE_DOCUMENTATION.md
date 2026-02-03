# Edit Profile Screen Documentation

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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile, useGetProfile } from '@/tanstack/useUsers';
```

## Context and State Management
- **Auth context:** `useAuth().user` provides initial values before the query resolves.
- **TanStack Query:**
  - `useGetProfile()` fetches the latest profile data.
  - `useUpdateProfile()` submits profile changes.
- **Local form state:** `firstName`, `lastName`, `phone`, and `avatar` preview/file data.
- **Avatar helpers:** `avatarFile`, `avatarRemoved`, `objectUrlRef` for temporary preview URLs.

## UI Structure
- **Header:** avatar preview + title and guidance text.
- **Avatar controls:** upload button + remove action.
- **Form grid:** first name, last name, email (read-only), phone.
- **Actions:** cancel + save changes; inline success/error messaging.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Avatar preview     [Upload] [Remove]       │
├────────────────────────────────────────────┤
│ First Name   Last Name                     │
│ Email (read-only)   Phone                  │
├────────────────────────────────────────────┤
│ Inline success / error                     │
│ [Cancel]  [Save changes]                   │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ (Avatar)  Edit profile                             │
│          Keep your contact info updated            │
│                                                    │
│ First Name  [__________]  Last Name [__________]   │
│ Email (disabled) [____________________________]    │
│ Phone [____________________________]               │
│                                                    │
│ [Cancel]  [Save changes]                           │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **First and last name**
  ```tsx
  <input
    value={firstName}
    onChange={(event) => setFirstName(event.target.value)}
    className="form-input"
  />
  ```

- **Email (disabled)**
  ```tsx
  <input value={email} disabled className="form-input-disabled" />
  ```

- **Avatar upload**
  ```tsx
  <input
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    className="hidden"
  />
  ```

## API Integration
- **Endpoint:** `PUT /api/users/profile`.
- **Payload options:**
  - JSON body for text-only updates.
  - `FormData` for avatar uploads.
- **Hook:** `useUpdateProfile()` handles the mutation and returns updated user data.

## Components Used
- React + React Router DOM: `Link`, `useNavigate`.
- Tailwind CSS utilities: `form-input`, `btn-primary`, `btn-secondary`.

## Error Handling
- Local validation for required fields.
- API errors surface via `error.response?.data?.message` fallback.
- Inline feedback beneath the form.

## Navigation Flow
- Route: `/profile/edit`.
- `Cancel` ➞ `/profile`.
- On successful update, navigate back to `/profile`.

## Functions Involved
- **`handleFileChange`** — creates preview URL and stores selected file.
  ```tsx
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarFile(file);
  };
  ```

- **`handleSubmit`** — builds JSON or `FormData` payload and submits.
  ```tsx
  const payload = avatarFile
    ? buildFormData()
    : { firstName, lastName, phone, avatar: avatarRemoved ? null : undefined };
  await updateProfile.mutateAsync(payload);
  ```

## Future Enhancements
- Add image cropping + size validation.
- Add phone formatting/validation.
- Support avatar removal confirmations.

