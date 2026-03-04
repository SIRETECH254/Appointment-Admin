import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceAPI, userAPI } from '../api';
import type { AssignServicesToStaffPayload, CreateServicePayload, GetServicesParams, UpdateServicePayload, IService, ServicesListResponse, ServiceDetailResponse } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all services
export const useGetAllServices = (params: GetServicesParams = {}) => {
  return useQuery<ServicesListResponse>({
    queryKey: ['services', params],
    queryFn: async () => {
      const response = await serviceAPI.getAllServices(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get services by staff member
export const useGetServicesByStaff = (staffId: string) => {
  return useQuery<{ services: IService[] }>({
    queryKey: ['services', 'staff', staffId],
    queryFn: async () => {
      // First, get the staff user to get their services array
      const userResponse = await userAPI.getUserById(staffId);
      const user = userResponse.data.data.user;
      
      if (!user || !user.services || user.services.length === 0) {
        return { services: [] };
      }

      // Get service IDs from user.services (could be populated or just IDs)
      const serviceIds = user.services.map((s: any) => 
        typeof s === 'string' ? s : s._id || s
      );

      // Fetch all services and filter to only those assigned to this staff
      const allServicesResponse = await serviceAPI.getAllServices({ status: 'active' });
      const allServices = allServicesResponse.data.data.services ?? [];
      
      const staffServices = allServices.filter((service: IService) => 
        serviceIds.includes(service._id)
      );

      return { services: staffServices };
    },
    enabled: !!staffId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single service
export const useGetServiceById = (serviceId: string) => {
  return useQuery<ServiceDetailResponse>({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await serviceAPI.getService(serviceId);
      return response.data.data;
    },
    enabled: !!serviceId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Create service
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceDetailResponse, Error, CreateServicePayload>({
    mutationFn: async (serviceData: CreateServicePayload) => {
      const response = await serviceAPI.createService(serviceData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      console.log('Service created successfully');
    },
    onError: (error: any) => {
      console.error('Create service error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Update service
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceDetailResponse, Error, { serviceId: string; serviceData: UpdateServicePayload }>({
    mutationFn: async ({ serviceId, serviceData }: { serviceId: string; serviceData: UpdateServicePayload }) => {
      const response = await serviceAPI.updateService(serviceId, serviceData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      console.log('Service updated successfully');
    },
    onError: (error: any) => {
      console.error('Update service error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Delete service
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (serviceId: string) => {
      const response = await serviceAPI.deleteService(serviceId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      console.log('Service deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete service error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Toggle service status
export const useToggleServiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<ServiceDetailResponse, Error, string>({
    mutationFn: async (serviceId: string) => {
      const response = await serviceAPI.toggleServiceStatus(serviceId);
      return response.data.data;
    },
    onSuccess: (_, serviceId) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] });
      console.log('Service status updated successfully');
    },
    onError: (error: any) => {
      console.error('Toggle service status error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Assign services to staff
export const useAssignServicesToStaff = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { userId: string; data: AssignServicesToStaffPayload }>({
    mutationFn: async ({ userId, data }: { userId: string; data: AssignServicesToStaffPayload }) => {
      const response = await serviceAPI.assignServicesToStaff(userId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      console.log('Services assigned to staff successfully');
    },
    onError: (error: any) => {
      console.error('Assign services error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};
