# Dashboard Documentation

## Table of Contents
- [Overview](#overview)
- [API Integration](#api-integration)
- [TanStack Query Hooks](#tanstack-query-hooks)
- [Component Documentation](#component-documentation)
- [Type Definitions](#type-definitions)
- [Usage Examples](#usage-examples)
- [Integration Guide](#integration-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Dashboard module provides comprehensive analytics and statistics for both admin users and customers. It aggregates data from various modules including appointments, payments, services, and users to provide insights and overviews.

### Dashboard Features

- **Admin Dashboard** - Comprehensive system-wide analytics
- **Client Dashboard** - Personalized customer statistics
- **Revenue Analytics** - Financial performance tracking
- **Appointment Statistics** - Appointment performance metrics
- **Service Demand** - Service popularity and demand analytics
- **Staff Activity** - Staff performance metrics

### Dashboard Types

1. **Admin Dashboard** - System-wide statistics and analytics (admin only)
2. **Client Dashboard** - Customer-specific statistics and overview (authenticated customers)
3. **Revenue Dashboard** - Financial performance metrics (admin only)
4. **Appointment Dashboard** - Appointment management statistics (admin only)
5. **Service Demand Dashboard** - Service popularity analytics (admin only)
6. **Staff Activity Dashboard** - Staff performance metrics (admin only)

### Location

- **API Functions:** `src/api/index.ts`
- **TanStack Query Hooks:** `src/tanstack/useDashboard.ts`
- **Component:** `src/routes/protected/Dashboard.tsx`
- **Type Definitions:** `src/types/api.types.ts`

---

## API Integration

### Base Path

All dashboard endpoints are prefixed with `/api/dashboard`

### API Functions

#### `getAdminDashboard()`

**Purpose:** Get admin dashboard statistics

**Endpoint:** `GET /api/dashboard/admin`

**Access:** Admin users only

**Response Structure:**
```typescript
{
  success: true,
  data: {
    overview: {
      appointments: {
        total: number,
        byStatus: {
          pending: number,
          confirmed: number,
          completed: number,
          cancelled: number,
          no_show: number
        }
      },
      payments: {
        total: number,
        totalAmount: number,
        byStatus: {
          pending: number,
          success: number,
          failed: number
        },
        byMethod: {
          mpesa: number,
          card: number,
          cash: number
        }
      },
      users: {
        total: number,
        active: number,
        verified: number,
        byRole: {
          customers: number,
          staff: number,
          admins: number
        }
      },
      services: {
        total: number,
        active: number
      },
      revenue: {
        total: number,
        outstanding: number
      }
    },
    recentActivity: {
      appointments: IAppointment[],
      payments: IPayment[],
      users: IUser[]
    }
  }
}
```

**Usage:**
```typescript
import { dashboardAPI } from '@/api';

const response = await dashboardAPI.getAdminDashboard();
```

---

#### `getClientDashboard()`

**Purpose:** Get client dashboard statistics

**Endpoint:** `GET /api/dashboard/client`

**Access:** Authenticated customers only

**Response Structure:**
```typescript
{
  success: true,
  data: {
    overview: {
      appointments: {
        total: number,
        byStatus: {
          pending: number,
          confirmed: number,
          completed: number,
          cancelled: number,
          no_show: number
        }
      },
      payments: {
        total: number,
        totalAmount: number
      },
      financial: {
        totalSpent: number,
        outstandingBalance: number
      }
    },
    recentActivity: {
      appointments: IAppointment[],
      payments: IPayment[]
    }
  }
}
```

**Usage:**
```typescript
import { dashboardAPI } from '@/api';

const response = await dashboardAPI.getClientDashboard();
```

---

#### `getRevenueStats(params?)`

**Purpose:** Get revenue analytics

**Endpoint:** `GET /api/dashboard/revenue`

**Access:** Admin users only

**Query Parameters:**
- `period` (optional): `'daily' | 'weekly' | 'monthly' | 'yearly'` (default: `'monthly'`)
- `startDate` (optional): Start date in ISO format
- `endDate` (optional): End date in ISO format

**Response Structure:**
```typescript
{
  success: true,
  data: {
    period: {
      start: string,
      end: string,
      type: string
    },
    revenue: {
      total: number,
      outstanding: number,
      byMethod: {
        mpesa: number,
        card: number,
        cash: number
      }
    },
    topCustomers: Array<{
      customer: IUser,
      total: number
    }>,
    paymentCount: number
  }
}
```

**Usage:**
```typescript
import { dashboardAPI } from '@/api';

// Default (last 30 days, monthly)
const response = await dashboardAPI.getRevenueStats();

// Custom period
const response = await dashboardAPI.getRevenueStats({
  period: 'weekly',
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});
```

---

#### `getAppointmentStats()`

**Purpose:** Get appointment statistics

**Endpoint:** `GET /api/dashboard/appointments`

**Access:** Admin users only

**Response Structure:**
```typescript
{
  success: true,
  data: {
    overview: {
      total: number,
      byStatus: {
        pending: number,
        confirmed: number,
        completed: number,
        cancelled: number,
        no_show: number
      }
    },
    performance: {
      completionRate: number,
      cancellationRate: number,
      noShowRate: number,
      averageDuration: number,
      averageActualDuration: number,
      completed: number
    }
  }
}
```

**Usage:**
```typescript
import { dashboardAPI } from '@/api';

const response = await dashboardAPI.getAppointmentStats();
```

---

#### `getServiceDemandStats()`

**Purpose:** Get service demand analytics

**Endpoint:** `GET /api/dashboard/service-demand`

**Access:** Admin users only

**Response Structure:**
```typescript
{
  success: true,
  data: {
    totalServices: number,
    serviceDemand: Array<{
      service: IService,
      count: number,
      totalRevenue: number
    }>,
    serviceRevenue: Record<string, number>
  }
}
```

**Usage:**
```typescript
import { dashboardAPI } from '@/api';

const response = await dashboardAPI.getServiceDemandStats();
```

---

#### `getStaffActivityStats(params?)`

**Purpose:** Get staff activity statistics

**Endpoint:** `GET /api/dashboard/staff-activity`

**Access:** Admin users only

**Query Parameters:**
- `period` (optional): `'daily' | 'weekly' | 'monthly' | 'yearly'` (default: `'monthly'`)

**Response Structure:**
```typescript
{
  success: true,
  data: {
    overview: {
      total: number,
      active: number,
      activeInPeriod: number
    },
    period: {
      start: string,
      end: string,
      type: string
    },
    topStaff: Array<{
      staff: IUser,
      appointmentCount: number,
      completedCount: number
    }>
  }
}
```

**Usage:**
```typescript
import { dashboardAPI } from '@/api';

// Default (monthly)
const response = await dashboardAPI.getStaffActivityStats();

// Custom period
const response = await dashboardAPI.getStaffActivityStats({ period: 'weekly' });
```

---

## TanStack Query Hooks

All dashboard hooks are located in `src/tanstack/useDashboard.ts` and follow the same patterns as other query hooks in the application.

### Hook Naming Convention

- Query hooks use the `useGet` prefix
- All hooks return standard TanStack Query return values

### Available Hooks

#### `useGetAdminDashboard()`

**Purpose:** Fetch admin dashboard data

**Returns:**
```typescript
{
  data: AdminDashboardResponse | undefined,
  isLoading: boolean,
  isFetching: boolean,
  isError: boolean,
  error: Error | null,
  refetch: () => void
}
```

**Usage:**
```typescript
import { useGetAdminDashboard } from '@/tanstack';

function AdminDashboard() {
  const { data, isLoading, isError } = useGetAdminDashboard();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading dashboard</div>;

  return <div>{/* Render dashboard */}</div>;
}
```

---

#### `useGetClientDashboard()`

**Purpose:** Fetch client dashboard data

**Returns:** Same structure as `useGetAdminDashboard()`

**Usage:**
```typescript
import { useGetClientDashboard } from '@/tanstack';

function ClientDashboard() {
  const { data, isLoading } = useGetClientDashboard();
  // ...
}
```

---

#### `useGetRevenueStats(params?)`

**Purpose:** Fetch revenue analytics

**Parameters:**
- `params` (optional): `GetRevenueStatsParams`

**Returns:** Standard TanStack Query return values

**Usage:**
```typescript
import { useGetRevenueStats } from '@/tanstack';

function RevenueAnalytics() {
  const { data } = useGetRevenueStats({
    period: 'monthly',
    startDate: '2025-01-01',
    endDate: '2025-01-31'
  });
  // ...
}
```

---

#### `useGetAppointmentStats()`

**Purpose:** Fetch appointment statistics

**Returns:** Standard TanStack Query return values

**Usage:**
```typescript
import { useGetAppointmentStats } from '@/tanstack';

function AppointmentStats() {
  const { data } = useGetAppointmentStats();
  // ...
}
```

---

#### `useGetServiceDemandStats()`

**Purpose:** Fetch service demand analytics

**Returns:** Standard TanStack Query return values

**Usage:**
```typescript
import { useGetServiceDemandStats } from '@/tanstack';

function ServiceDemand() {
  const { data } = useGetServiceDemandStats();
  // ...
}
```

---

#### `useGetStaffActivityStats(params?)`

**Purpose:** Fetch staff activity statistics

**Parameters:**
- `params` (optional): `GetStaffActivityStatsParams`

**Returns:** Standard TanStack Query return values

**Usage:**
```typescript
import { useGetStaffActivityStats } from '@/tanstack';

function StaffActivity() {
  const { data } = useGetStaffActivityStats({ period: 'monthly' });
  // ...
}
```

---

## Component Documentation

### Dashboard Component

**Location:** `src/routes/protected/Dashboard.tsx`

**Purpose:** Main dashboard component that displays different views based on user role

**Features:**
- Role-based rendering (admin vs client)
- Overview statistics cards
- Recent activity sections
- Loading and error states
- Responsive design

**Component Structure:**

```typescript
function Dashboard() {
  // Role detection
  // Data fetching (admin or client hooks)
  // Conditional rendering
  // Stat cards
  // Recent activity lists
}
```

**Props:** None (uses auth context for user role)

**State Management:**
- Uses TanStack Query hooks for data fetching
- Uses AuthContext for user role detection

**Styling:**
- Uses classes from `index.css` and `components.css`
- Layout: `page-container`, `section`, `stack-4`
- Buttons: `btn-primary`, `btn-secondary`
- Tables: `table-container`, `table`
- Badges: `badge`, `badge-success`, `badge-error`

---

## Type Definitions

### Request Types

#### `GetRevenueStatsParams`

```typescript
export interface GetRevenueStatsParams {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string; // ISO format
  endDate?: string; // ISO format
}
```

#### `GetStaffActivityStatsParams`

```typescript
export interface GetStaffActivityStatsParams {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}
```

### Response Types

#### `AdminDashboardResponse`

```typescript
export interface AdminDashboardResponse {
  overview: {
    appointments: {
      total: number;
      byStatus: {
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        no_show: number;
      };
    };
    payments: {
      total: number;
      totalAmount: number;
      byStatus: {
        pending: number;
        success: number;
        failed: number;
      };
      byMethod: {
        mpesa: number;
        card: number;
        cash: number;
      };
    };
    users: {
      total: number;
      active: number;
      verified: number;
      byRole: {
        customers: number;
        staff: number;
        admins: number;
      };
    };
    services: {
      total: number;
      active: number;
    };
    revenue: {
      total: number;
      outstanding: number;
    };
  };
  recentActivity: {
    appointments: IAppointment[];
    payments: IPayment[];
    users: IUser[];
  };
}
```

#### `ClientDashboardResponse`

```typescript
export interface ClientDashboardResponse {
  overview: {
    appointments: {
      total: number;
      byStatus: {
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        no_show: number;
      };
    };
    payments: {
      total: number;
      totalAmount: number;
    };
    financial: {
      totalSpent: number;
      outstandingBalance: number;
    };
  };
  recentActivity: {
    appointments: IAppointment[];
    payments: IPayment[];
  };
}
```

#### `RevenueStatsResponse`

```typescript
export interface RevenueStatsResponse {
  period: {
    start: string;
    end: string;
    type: string;
  };
  revenue: {
    total: number;
    outstanding: number;
    byMethod: {
      mpesa: number;
      card: number;
      cash: number;
    };
  };
  topCustomers: Array<{
    customer: IUser;
    total: number;
  }>;
  paymentCount: number;
}
```

#### `AppointmentStatsResponse`

```typescript
export interface AppointmentStatsResponse {
  overview: {
    total: number;
    byStatus: {
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      no_show: number;
    };
  };
  performance: {
    completionRate: number;
    cancellationRate: number;
    noShowRate: number;
    averageDuration: number;
    averageActualDuration: number;
    completed: number;
  };
}
```

#### `ServiceDemandStatsResponse`

```typescript
export interface ServiceDemandStatsResponse {
  totalServices: number;
  serviceDemand: Array<{
    service: IService;
    count: number;
    totalRevenue: number;
  }>;
  serviceRevenue: Record<string, number>;
}
```

#### `StaffActivityStatsResponse`

```typescript
export interface StaffActivityStatsResponse {
  overview: {
    total: number;
    active: number;
    activeInPeriod: number;
  };
  period: {
    start: string;
    end: string;
    type: string;
  };
  topStaff: Array<{
    staff: IUser;
    appointmentCount: number;
    completedCount: number;
  }>;
}
```

---

## Usage Examples

### Example 1: Admin Dashboard

```typescript
import { useGetAdminDashboard } from '@/tanstack';

function AdminDashboard() {
  const { data, isLoading, isError } = useGetAdminDashboard();

  if (isLoading) return <div>Loading dashboard...</div>;
  if (isError) return <div>Error loading dashboard</div>;

  const { overview, recentActivity } = data.data;

  return (
    <div className="page-container section">
      <h1>Admin Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Appointments" value={overview.appointments.total} />
        <StatCard title="Total Revenue" value={overview.revenue.total} />
        <StatCard title="Total Users" value={overview.users.total} />
      </div>

      {/* Recent Activity */}
      <RecentActivityList appointments={recentActivity.appointments} />
    </div>
  );
}
```

### Example 2: Client Dashboard

```typescript
import { useGetClientDashboard } from '@/tanstack';

function ClientDashboard() {
  const { data, isLoading } = useGetClientDashboard();

  if (isLoading) return <div>Loading...</div>;

  const { overview, recentActivity } = data.data;

  return (
    <div className="page-container section">
      <h1>My Dashboard</h1>
      
      <div className="stack-4">
        <StatCard title="My Appointments" value={overview.appointments.total} />
        <StatCard title="Total Spent" value={overview.financial.totalSpent} />
        <StatCard title="Outstanding Balance" value={overview.financial.outstandingBalance} />
      </div>
    </div>
  );
}
```

### Example 3: Revenue Analytics

```typescript
import { useGetRevenueStats } from '@/tanstack';

function RevenueAnalytics() {
  const { data, isLoading } = useGetRevenueStats({
    period: 'monthly',
    startDate: '2025-01-01',
    endDate: '2025-01-31'
  });

  if (isLoading) return <div>Loading...</div>;

  const { revenue, topCustomers } = data.data;

  return (
    <div>
      <h2>Total Revenue: {revenue.total}</h2>
      <h3>Top Customers</h3>
      <ul>
        {topCustomers.map((item, index) => (
          <li key={index}>
            {item.customer.firstName} {item.customer.lastName}: {item.total}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Integration Guide

### Step 1: Add API Functions

Add dashboard API functions to `src/api/index.ts`:

```typescript
export const dashboardAPI = {
  getAdminDashboard: () => api.get('/api/dashboard/admin'),
  getClientDashboard: () => api.get('/api/dashboard/client'),
  getRevenueStats: (params?: GetRevenueStatsParams) => 
    api.get('/api/dashboard/revenue', { params }),
  getAppointmentStats: () => api.get('/api/dashboard/appointments'),
  getServiceDemandStats: () => api.get('/api/dashboard/service-demand'),
  getStaffActivityStats: (params?: GetStaffActivityStatsParams) => 
    api.get('/api/dashboard/staff-activity', { params }),
};
```

### Step 2: Add Type Definitions

Add dashboard types to `src/types/api.types.ts` (see Type Definitions section above).

### Step 3: Create TanStack Query Hooks

Create `src/tanstack/useDashboard.ts` with all query hooks (see TanStack Query Hooks section above).

### Step 4: Export Hooks

Add to `src/tanstack/index.ts`:

```typescript
export * from './useDashboard';
```

### Step 5: Implement Dashboard Component

Replace `src/routes/protected/Dashboard.tsx` with full implementation that:
- Detects user role from auth context
- Renders appropriate dashboard view
- Uses TanStack Query hooks for data fetching
- Displays statistics and recent activity
- Handles loading and error states

---

## Best Practices

1. **Role-Based Access**: Always check user roles before rendering admin-specific content
2. **Loading States**: Show loading indicators while fetching data
3. **Error Handling**: Display user-friendly error messages
4. **Data Formatting**: Format currency, dates, and percentages appropriately
5. **Responsive Design**: Ensure dashboard works on all screen sizes
6. **Caching**: TanStack Query handles caching automatically, but consider stale times for frequently updated data
7. **Comments**: Add comprehensive comments explaining functionality

---

## Troubleshooting

### Common Issues

1. **401 Unauthorized Errors**
   - Ensure user is authenticated
   - Check that admin endpoints are only accessed by admin users
   - Verify token is valid and not expired

2. **403 Forbidden Errors**
   - Verify user has correct role (admin for admin endpoints)
   - Check backend role-based access control

3. **Data Not Loading**
   - Check network tab for API calls
   - Verify API endpoints are correct
   - Check TanStack Query cache and stale times
   - Ensure query keys are correct

4. **TypeScript Errors**
   - Verify all types are properly imported
   - Check that response types match backend structure
   - Ensure optional properties are handled correctly

5. **Component Not Rendering**
   - Check user role detection logic
   - Verify conditional rendering conditions
   - Check for loading/error states blocking render

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Maintainer:** Appointment Admin Development Team
