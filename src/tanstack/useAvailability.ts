import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { availabilityAPI } from '../api';
import type { GetDayAvailabilityParams, GetSlotsParams, GetSlotsResponse } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get available slots
export const useGetSlots = (
  params: GetSlotsParams | null,
  options?: Omit<UseQueryOptions<GetSlotsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['availability', 'slots', params],
    queryFn: async () => {
      if (!params) {
        throw new Error('Slots params are required');
      }
      const response = await availabilityAPI.getSlots(params);
      return response.data.data;
    },
    enabled: !!params && (options?.enabled !== false),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    ...options,
  });
};

// Get day availability
export const useGetDayAvailability = (params: GetDayAvailabilityParams) => {
  return useQuery({
    queryKey: ['availability', 'day', params],
    queryFn: async () => {
      const response = await availabilityAPI.getDayAvailability(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
