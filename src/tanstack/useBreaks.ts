import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { breakAPI } from '../api';
import type { CreateBreakPayload, GetBreaksParams, UpdateBreakPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all breaks
export const useGetAllBreaks = (params: GetBreaksParams = {}) => {
  return useQuery({
    queryKey: ['breaks', params],
    queryFn: async () => {
      const response = await breakAPI.getAllBreaks(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single break
export const useGetBreakById = (breakId: string) => {
  return useQuery({
    queryKey: ['break', breakId],
    queryFn: async () => {
      const response = await breakAPI.getBreak(breakId);
      return response.data.data;
    },
    enabled: !!breakId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Create break
export const useCreateBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (breakData: CreateBreakPayload) => {
      const response = await breakAPI.createBreak(breakData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breaks'] });
      console.log('Break created successfully');
    },
    onError: (error: any) => {
      console.error('Create break error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create break';
      console.error('Error:', errorMessage);
    },
  });
};

// Update break
export const useUpdateBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ breakId, breakData }: { breakId: string; breakData: UpdateBreakPayload }) => {
      const response = await breakAPI.updateBreak(breakId, breakData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['breaks'] });
      queryClient.invalidateQueries({ queryKey: ['break', variables.breakId] });
      console.log('Break updated successfully');
    },
    onError: (error: any) => {
      console.error('Update break error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update break';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete break
export const useDeleteBreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (breakId: string) => {
      const response = await breakAPI.deleteBreak(breakId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breaks'] });
      console.log('Break deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete break error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete break';
      console.error('Error:', errorMessage);
    },
  });
};
