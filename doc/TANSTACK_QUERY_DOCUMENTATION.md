# TanStack Query Documentation

## Overview

This document provides comprehensive documentation for TanStack Query (React Query) implementation in the Appointment Admin application. TanStack Query is used for server state management, providing data fetching, caching, synchronization, and updating capabilities.

**Location:** All TanStack Query hooks are located in the `src/tanstack/` folder.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Setup and Configuration](#setup-and-configuration)
3. [QueryClient Configuration](#queryclient-configuration)
4. [Custom Hooks Pattern](#custom-hooks-pattern)
5. [Query Hooks (useQuery)](#query-hooks-usequery)
6. [Mutation Hooks (useMutation)](#mutation-hooks-usemutation)
7. [Cache Invalidation Strategies](#cache-invalidation-strategies)
8. [Error Handling Patterns](#error-handling-patterns)
9. [Best Practices](#best-practices)
10. [Usage Examples](#usage-examples)
11. [Integration with Existing Code](#integration-with-existing-code)
12. [Troubleshooting](#troubleshooting)
13. [Notes](#notes)

---

## Introduction

TanStack Query (formerly React Query) is a powerful data synchronization library for React applications. It provides:

- **Automatic Caching**: Data is cached automatically with configurable stale times
- **Background Refetching**: Keeps data fresh automatically
- **Request Deduplication**: Prevents duplicate requests
- **Optimistic Updates**: Update UI before server confirms
- **Error Handling**: Built-in error states and retry logic
- **Loading States**: Built-in loading and fetching states

### Why TanStack Query?

- Reduces boilerplate code for data fetching
- Provides excellent developer experience
- Handles complex caching scenarios automatically
- Works seamlessly with existing API layer (axios)
- Integrates well with Redux for client state

---

## Setup and Configuration

### Installation

```bash
npm install @tanstack/react-query
```

### Provider Setup

The QueryClientProvider is set up in `src/main.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Wrap your app
<QueryClientProvider client={queryClient}>
  {/* Your app */}
</QueryClientProvider>
```

---

## QueryClient Configuration

### Default Options

The QueryClient is configured with the following default options:

- **staleTime**: `5 * 60 * 1000` (5 minutes)
  - Data is considered fresh for 5 minutes
  - No refetch occurs during this time

- **gcTime**: `10 * 60 * 1000` (10 minutes, formerly cacheTime)
  - Unused data is garbage collected after 10 minutes
  - Data remains in cache for this duration even if not used

- **retry**: `1`
  - Failed requests are retried once
  - Reduces unnecessary network calls

- **refetchOnWindowFocus**: `false`
  - Prevents automatic refetch when window regains focus
  - Better for admin dashboard workflows

### Mutation Default Options

- **retry**: `1`
  - Failed mutations are retried once

---

## Custom Hooks Pattern

### Folder Structure

All TanStack Query hooks are organized in the `src/tanstack/` folder:

```
src/
└── tanstack/
    ├── index.ts
    ├── useUsers.ts
    ├── useRoles.ts
    ├── useServices.ts
    ├── useAppointments.ts
    ├── useBreaks.ts
    ├── useAvailability.ts
    ├── usePayments.ts
    ├── useNotifications.ts
    ├── useContact.ts
    ├── useDashboard.ts
    └── useStoreConfig.ts
```

### Hook Naming Convention

- **Query Hooks**: `useGet[Resource]` or `useGet[Resource]ById`
  - Example: `useGetUsers`, `useGetUserById`

- **Mutation Hooks**: `use[Action][Resource]`
  - Example: `useCreateService`, `useUpdateRole`, `useDeleteAppointment`

---

## Query Hooks (useQuery)

Query hooks are used for GET operations (fetching data).

### Basic Structure

```typescript
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../api';

export const useGetUsers = (params = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await userAPI.getAllUsers(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
```

### Query Hook Options

- **queryKey**: Array that uniquely identifies the query
  - Format: `['resource', params/id]`
  - Used for cache management and invalidation

- **queryFn**: Async function that fetches data
  - Must return a Promise
  - Typically calls API and returns `response.data`

- **enabled**: Boolean to conditionally enable/disable query
  - Useful when query depends on other data
  - Example: `enabled: !!userId`

- **staleTime**: Time in milliseconds before data is considered stale
  - Default: 5 minutes (from QueryClient config)

- **gcTime**: Time in milliseconds before unused data is garbage collected
  - Default: 10 minutes (from QueryClient config)

### Query Hook Return Value

```typescript
const {
  data,           // The data returned from queryFn
  isLoading,      // True if query is fetching for the first time
  isFetching,     // True if query is fetching (including refetches)
  isError,        // True if query encountered an error
  error,          // Error object if query failed
  refetch,        // Function to manually refetch
  isSuccess,      // True if query succeeded
} = useGetUsers();
```

### Conditional Queries

```typescript
export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await userAPI.getUserById(userId);
      return response.data;
    },
    enabled: !!userId, // Only run if userId exists
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
```

---

## Mutation Hooks (useMutation)

Mutation hooks are used for POST, PUT, PATCH, and DELETE operations.

### Basic Structure

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceAPI } from '../api';

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: any) => {
      const response = await serviceAPI.createService(serviceData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({ queryKey: ['services'] });
      console.log('Service created successfully');
    },
    onError: (error: any) => {
      console.error('Create service error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create service';
      console.error('Error:', errorMessage);
    },
  });
};
```

### Mutation Hook Options

- **mutationFn**: Async function that performs the mutation
  - Receives variables as parameter
  - Must return a Promise

- **onSuccess**: Callback executed on successful mutation
  - Typically used for cache invalidation and notifications

- **onError**: Callback executed on mutation failure
  - Typically used for error handling and notifications

### Mutation Hook Return Value

```typescript
const {
  mutate,         // Function to trigger mutation
  mutateAsync,    // Async function that returns a Promise
  isPending,      // True if mutation is in progress
  isError,        // True if mutation failed
  error,          // Error object if mutation failed
  isSuccess,      // True if mutation succeeded
  data,           // Data returned from successful mutation
  reset,          // Function to reset mutation state
} = useCreateService();

// Usage
mutate(serviceData);
// or
await mutateAsync(serviceData);
```

### Mutation with Variables

```typescript
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, serviceData }: { serviceId: string; serviceData: any }) => {
      const response = await serviceAPI.updateService(serviceId, serviceData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and specific service
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      console.log('Service updated successfully');
    },
    onError: (error: any) => {
      console.error('Update service error:', error);
    },
  });
};
```

---

## Cache Invalidation Strategies

### Invalidate Queries

Invalidate queries to trigger refetch:

```typescript
// Invalidate all queries with key 'users'
queryClient.invalidateQueries({ queryKey: ['users'] });

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: ['user', userId] });

// Invalidate all queries starting with 'appointment'
queryClient.invalidateQueries({ queryKey: ['appointment'] });
```

### Refetch Queries

Manually refetch queries:

```typescript
// Refetch all 'appointments' queries
queryClient.refetchQueries({ queryKey: ['appointments'] });
```

### Update Query Data

Update cache directly without refetching:

```typescript
queryClient.setQueryData(['user', userId], (oldData) => {
  return { ...oldData, ...updatedData };
});
```

### Common Patterns

1. **After Create**: Invalidate list query
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['services'] });
   }
   ```

2. **After Update**: Invalidate both list and item queries
   ```typescript
   onSuccess: (_, variables) => {
     queryClient.invalidateQueries({ queryKey: ['appointments'] });
     queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
   }
   ```

3. **After Delete**: Invalidate list query
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['users'] });
   }
   ```

---

## Error Handling Patterns

### Query Error Handling

```typescript
const { data, isError, error } = useGetUsers();

if (isError) {
  const errorMessage = error?.response?.data?.message || 'Failed to fetch users';
  // Handle error (show toast, alert, etc.)
}
```

### Mutation Error Handling

```typescript
const createService = useCreateService();

const handleCreate = async (formData: any) => {
  try {
    await createService.mutateAsync(formData);
    // Success handling
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || 'Failed to create service';
    // Error handling
  }
};
```

### Global Error Handling

Errors are logged in the mutation's `onError` callback. For user-facing errors, consider:

- Toast notifications (can be added later)
- Alert dialogs
- Error state in UI components

---

## Best Practices

### 1. Query Key Structure

- Use consistent, hierarchical query keys
- Include all parameters that affect the query
- Example: `['appointments', { page: 1, limit: 10 }]`

### 2. Stale Time Configuration

- Set appropriate stale times based on data freshness requirements
- Use longer stale times for relatively static data
- Use shorter stale times for frequently changing data

### 3. Conditional Queries

- Use `enabled` option to prevent unnecessary queries
- Example: `enabled: !!appointmentId` prevents query when appointmentId is missing

### 4. Cache Invalidation

- Invalidate related queries after mutations
- Invalidate both list and detail queries after updates
- Consider optimistic updates for better UX

### 5. Error Handling

- Always handle errors in mutations
- Provide user-friendly error messages
- Log errors for debugging

### 6. TypeScript

- Type all hook parameters and return values
- Use proper types from API responses
- Leverage TypeScript for better developer experience

### 7. Performance

- Use `staleTime` to reduce unnecessary refetches
- Use `gcTime` to manage cache size
- Consider pagination for large datasets

---

## Usage Examples

### Example 1: Fetching Data

```typescript
import { useGetAllUsers } from '../tanstack';

function UsersList() {
  const { data, isLoading, isError, error } = useGetAllUsers({ page: 1, limit: 10 });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      {data?.data?.items?.map((user: any) => (
        <div key={user._id}>{user.firstName} {user.lastName}</div>
      ))}
    </div>
  );
}
```

### Example 2: Creating Data

```typescript
import { useCreateService } from '../tanstack';

function CreateServiceForm() {
  const createService = useCreateService();

  const handleSubmit = async (formData: any) => {
    try {
      await createService.mutateAsync(formData);
      // Navigate or show success message
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <button onClick={() => handleSubmit({ name: 'Consultation' })} disabled={createService.isPending}>
      {createService.isPending ? 'Creating...' : 'Create Service'}
    </button>
  );
}
```

### Example 3: Updating Data

```typescript
import { useRescheduleAppointment } from '../tanstack';

function EditAppointment({ appointmentId }: { appointmentId: string }) {
  const updateAppointment = useRescheduleAppointment();

  const handleUpdate = async (appointmentData: any) => {
    try {
      await updateAppointment.mutateAsync({ appointmentId, data: appointmentData });
      // Show success message
    } catch (error) {
      // Error handling
    }
  };

  return <button onClick={() => handleUpdate({ date: '2026-02-01' })}>Update</button>;
}
```

### Example 4: Conditional Query

```typescript
import { useGetAppointment } from '../tanstack';

function AppointmentDetails({ appointmentId }: { appointmentId?: string }) {
  const { data, isLoading } = useGetAppointment(appointmentId || '');

  if (!appointmentId) return <div>No appointment selected</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>{data?.data?.appointment?.status}</div>;
}
```

### Example 5: Multiple Queries

```typescript
import { useGetAppointment, useGetNotifications } from '../tanstack';

function Dashboard({ appointmentId }: { appointmentId: string }) {
  const { data: appointment } = useGetAppointment(appointmentId);
  const { data: notifications } = useGetNotifications({ page: 1, limit: 5 });

  return (
    <div>
      <div>Appointment Status: {appointment?.data?.appointment?.status}</div>
      <div>Notifications: {notifications?.data?.items?.length}</div>
    </div>
  );
}
```

---

## Integration with Existing Code

### API Layer

TanStack Query hooks use the existing API layer (`src/api/index.ts`):

```typescript
import { appointmentAPI } from '../api';

export const useGetAppointment = (appointmentId: string) => {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const response = await appointmentAPI.getAppointment(appointmentId);
      return response.data;
    },
  });
};
```

### Redux Integration

- TanStack Query handles server state (data from API)
- Redux handles client state (UI state, auth state)
- Both can coexist in the same application

### Auth Context

- Authentication is handled in `AuthContext` (`src/contexts/AuthContext.tsx`)
- API interceptors handle token management (`src/api/config.ts`)
- TanStack Query hooks automatically use authenticated requests

---

## Troubleshooting

### Common Issues

1. **Queries not refetching**
   - Check `staleTime` configuration
   - Verify query keys are correct
   - Ensure `refetchOnWindowFocus` is not blocking

2. **Cache not invalidating**
   - Verify query keys match exactly
   - Check that `invalidateQueries` is called in `onSuccess`

3. **TypeScript errors**
   - Ensure proper types are imported
   - Check API response types match expected types

4. **Multiple requests**
   - Check if queries are enabled unnecessarily
   - Verify request deduplication is working

---

## Notes

- All hooks follow TypeScript typing conventions
- Error handling uses console.error (toast notifications can be added later)
- Cache invalidation follows consistent patterns
- Query keys are structured as arrays: `['resource', params/id]`
- Hooks are organized by resource type for better maintainability
- Import paths in examples may need adjusting depending on component location

---

## Service Hooks

### useGetAllServices

Fetches all services with optional filtering.

```typescript
import { useGetAllServices } from '../tanstack/useServices';

// Get all active services
const { data, isLoading } = useGetAllServices({ status: 'active' });

// Get all services (admin)
const { data } = useGetAllServices({ status: 'inactive' });
```

**Parameters:**
- `params.status?: 'active' | 'inactive'` - Filter by service status (replaces deprecated `isActive` boolean)

**Note:** The API expects `status` query parameter, not `isActive`. Use `status: 'active'` to get active services.

### useGetServicesByStaff

Fetches services assigned to a specific staff member (for staff-first appointment flow).

```typescript
import { useGetServicesByStaff } from '../tanstack/useServices';

function ServiceSelector({ staffId }: { staffId: string }) {
  const { data, isLoading } = useGetServicesByStaff(staffId);
  const services = data?.services || [];
  
  return (
    <div>
      {services.map(service => (
        <div key={service._id}>{service.name}</div>
      ))}
    </div>
  );
}
```

**Parameters:**
- `staffId: string` - The staff member's user ID

**Returns:**
- `{ services: IService[] }` - Array of services assigned to the staff member

**Note:** This hook is automatically disabled if `staffId` is empty.

---

## User Hooks

### useGetStaffByService

Fetches staff members who provide a specific service (for service-first appointment flow).

```typescript
import { useGetStaffByService } from '../tanstack/useUsers';

function StaffSelector({ serviceId }: { serviceId: string }) {
  const { data, isLoading } = useGetStaffByService(serviceId);
  const staff = data?.users || [];
  
  return (
    <div>
      {staff.map(member => (
        <div key={member._id}>{member.firstName} {member.lastName}</div>
      ))}
    </div>
  );
}
```

**Parameters:**
- `serviceId: string` - The service ID

**Returns:**
- `{ users: IUser[] }` - Array of staff members who provide the service

**Note:** This hook is automatically disabled if `serviceId` is empty. Only works with single service selection.

---

## Availability Hooks

### useGetSlots

Fetches available time slots for a staff member, service(s), and date.

```typescript
import { useGetSlots } from '../tanstack/useAvailability';

// Single service
const { data, isLoading } = useGetSlots({
  staffId: 'staff123',
  serviceId: 'service456',
  date: '2025-01-30'
});

// Multiple services
const { data } = useGetSlots({
  staffId: 'staff123',
  serviceId: ['service456', 'service789'], // Array for multiple services
  date: '2025-01-30'
});
```

**Parameters:**
- `params.staffId: string` - Staff member ID (required)
- `params.serviceId: string | string[]` - Single service ID or array of service IDs (required)
- `params.date: string` - Date in YYYY-MM-DD format (required)

**Returns:**
- `{ slots: ITimeSlot[] }` - Array of available time slots

**Note:** When multiple services are provided, the API sums their durations to calculate the total appointment duration for slot generation.

---

**Last Updated:** February 2026  
**Version:** 1.0.0

