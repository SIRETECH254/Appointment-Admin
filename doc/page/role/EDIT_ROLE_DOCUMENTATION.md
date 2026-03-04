# Edit Role Screen Documentation

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
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetRoleById, useUpdateRole } from '../../../tanstack/useRoles';
import type { IRole } from '../../../types/api.types';
```

## Context and State Management
- **Route Params:** `useParams()` extracts `id` from URL (route: `/roles/:id/edit`).
- **TanStack Query:** `useGetRoleById(id)` fetches role data for form pre-population.
- **Update Mutation:** `useUpdateRole()` handles role update with cache invalidation.
- **Local State:**
  - `name` - Role name (read-only if system role, editable if custom role)
  - `displayName` - Role display name (required)
  - `description` - Role description (optional)
  - `permissions` - Permissions array (array of strings)
  - `isActive` - Role active status (checkbox)
  - `inlineMessage` - Success/error feedback message
  - `isSubmitting` - Form submission state

## UI Structure
- **Header Card:** Title "Edit Role" with description.
- **Form Card:** Two-column grid layout with form fields.
- **Form Fields:** name (read-only if system role), displayName, description, permissions (textarea or array input), isActive checkbox.
- **Actions:** Cancel button (navigate back), Save button (submit form).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Edit Role                                  │
│ Update role information and permissions.   │
├────────────────────────────────────────────┤
│ Name (read-only if system) │ Display Name │
│ Description                                │
│ Permissions (textarea/array)              │
│ Active Status (checkbox)                   │
├────────────────────────────────────────────┤
│ [Cancel]  [Save Changes]                   │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Edit Role                                          │
│ Update role information and permissions.           │
│                                                    │
│ Name: [admin] (read-only - system role)           │
│ Display Name: [Admin              ]                │
│ Description: [Full system access...]               │
│ Permissions: [*] or [view_users, manage_appointments] │
│ ☑ Active                                          │
│                                                    │
│ [Cancel]                    [Save Changes]        │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Name:** Text input (read-only if `isSystemRole === true`, disabled), `input-disabled` class. Editable if custom role, `input` class.
- **Display Name:** Text input (required), `input` class.
- **Description:** Textarea (optional), `input` class.
- **Permissions:** Textarea or comma-separated input (array of strings), `input` class. Accepts comma-separated values or JSON array format.
- **Active Status:** Checkbox for `isActive` boolean.

## API Integration
- **Get Endpoint:** `GET /api/roles/:roleId` via `useGetRoleById(roleId)`.
- **Update Endpoint:** `PUT /api/roles/:roleId` via `useUpdateRole()` mutation.
- **Request Payload:**
  ```typescript
  {
    displayName?: string,
    description?: string,
    permissions?: string[],
    isActive?: boolean
  }
  ```
- **Note:** System role name cannot be changed (blocked in API, name field is read-only in UI).
- **Response:** Updated role object.
- **Cache Invalidation:** Mutation invalidates `['roles']` and `['role', roleId]` queries.

## Components Used
- React Router DOM: `Link`, `useNavigate`, `useParams` for routing.
- TanStack Query: `useGetRoleById`, `useUpdateRole` hooks.
- Tailwind CSS classes: `label`, `input`, `input-disabled`, `btn-primary`, `btn-secondary`, `alert-success`, `alert-error`.

## Error Handling
- **Loading State:** Show loading indicator while fetching role data.
- **Error State:** Display `alert-error` with API error message if fetch or update fails.
- **Validation:** Client-side validation for required fields (displayName).
- **Submit Error:** Show inline error message if update fails, keep form data.
- **Success State:** Show `alert-success` message, then navigate after 1.2 seconds.
- **System Role Protection:** Prevent name changes for system roles (UI disabled, API will reject).

## Navigation Flow
- Route: `/roles/:id/edit`.
- **Cancel Button:** Navigate back to `/roles` (role list).
- **Success:** After successful update, navigate to `/roles` (role list).
- **Error:** Stay on edit page, show error message.

## Functions Involved
- **`handleSubmit`** — Validates form, builds payload, and submits update.
  ```tsx
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!displayName.trim()) {
      setInlineMessage({ type: 'error', text: 'Display name is required.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await updateRole.mutateAsync({
        roleId: id,
        roleData: { displayName, description, permissions, isActive }
      });
      setInlineMessage({ type: 'success', text: 'Role updated successfully.' });
      setTimeout(() => navigate('/roles'), 1200);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to update role.';
      setInlineMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  ```

- **`hydrateForm`** — Pre-populates form fields from fetched role data.
  ```tsx
  useEffect(() => {
    if (!role) return;
    setName(role.name ?? '');
    setDisplayName(role.displayName ?? '');
    setDescription(role.description ?? '');
    setPermissions(role.permissions ?? []);
    setIsActive(role.isActive ?? true);
  }, [role]);
  ```

- **`canSubmit`** — Computes whether form can be submitted.
  ```tsx
  const canSubmit = useMemo(() => {
    return Boolean(displayName.trim()) && !isSubmitting;
  }, [displayName, isSubmitting]);
  ```

- **`parsePermissions`** — Parses permissions input (comma-separated or array) into array.
  ```tsx
  const parsePermissions = (input: string): string[] => {
    if (!input.trim()) return [];
    // Handle comma-separated values
    return input.split(',').map(p => p.trim()).filter(Boolean);
  };
  ```

## Implementation Details
- **System Role Name:** Name field is disabled/read-only if `isSystemRole === true`. Shows helper text explaining why.
- **Permissions Input:** 
  - Accepts comma-separated values: "view_users, manage_appointments, delete_users"
  - Or array format: ["view_users", "manage_appointments"]
  - Special case: "*" means all permissions
  - Parse and validate on submit
- **Form Validation:** Display name is required, other fields are optional.
- **Permissions Array:** Store as array in state, display as comma-separated string in textarea for editing.
- **Success Feedback:** Show success message and navigate back to list after 1.2 seconds.

## Future Enhancements
- Visual permission selector (checkboxes for common permissions).
- Permission groups/categories.
- Permission validation (check if permission exists in system).
- Bulk permission assignment.
- Role cloning functionality.
- Permission templates/presets.
