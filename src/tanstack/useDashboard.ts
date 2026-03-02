import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../api';
import type {
  GetRevenueStatsParams,
  GetStaffActivityStatsParams,
} from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const DEFAULT_GC_TIME = 1000 * 60 * 10; // 10 minutes

/**
 * Hook to fetch admin dashboard statistics
 * @returns TanStack Query result with admin dashboard data
 */
export const useGetAdminDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const response = await dashboardAPI.getAdminDashboard();
      return response.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

/**
 * Hook to fetch client dashboard statistics
 * @returns TanStack Query result with client dashboard data
 */
export const useGetClientDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'client'],
    queryFn: async () => {
      const response = await dashboardAPI.getClientDashboard();
      return response.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

/**
 * Hook to fetch revenue analytics
 * @param params - Optional query parameters (period, startDate, endDate)
 * @returns TanStack Query result with revenue statistics
 */
export const useGetRevenueStats = (params?: GetRevenueStatsParams) => {
  return useQuery({
    queryKey: ['dashboard', 'revenue', params],
    queryFn: async () => {
      const response = await dashboardAPI.getRevenueStats(params);
      return response.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

/**
 * Hook to fetch appointment statistics
 * @returns TanStack Query result with appointment statistics
 */
export const useGetAppointmentStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'appointments'],
    queryFn: async () => {
      const response = await dashboardAPI.getAppointmentStats();
      return response.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

/**
 * Hook to fetch service demand analytics
 * @returns TanStack Query result with service demand statistics
 */
export const useGetServiceDemandStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'service-demand'],
    queryFn: async () => {
      const response = await dashboardAPI.getServiceDemandStats();
      return response.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

/**
 * Hook to fetch staff activity statistics
 * @param params - Optional query parameters (period)
 * @returns TanStack Query result with staff activity statistics
 */
export const useGetStaffActivityStats = (params?: GetStaffActivityStatsParams) => {
  return useQuery({
    queryKey: ['dashboard', 'staff-activity', params],
    queryFn: async () => {
      const response = await dashboardAPI.getStaffActivityStats(params);
      return response.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
