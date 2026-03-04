import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { storeConfigurationAPI } from '../api';
import type { UpdateStoreConfigurationPayload, StoreConfigurationResponse } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get store configuration
export const useGetStoreConfiguration = () => {
  return useQuery<StoreConfigurationResponse>({
    queryKey: ['store-configuration'],
    queryFn: async () => {
      const response = await storeConfigurationAPI.getConfiguration();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update store configuration
export const useUpdateStoreConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation<StoreConfigurationResponse, Error, UpdateStoreConfigurationPayload>({
    mutationFn: async (configData: UpdateStoreConfigurationPayload) => {
      const response = await storeConfigurationAPI.updateConfiguration(configData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-configuration'] });
      console.log('Store configuration updated successfully');
    },
    onError: (error: any) => {
      console.error('Update store configuration error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};
