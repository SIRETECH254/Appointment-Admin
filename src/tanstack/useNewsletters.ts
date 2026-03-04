import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { newsletterAPI } from '../api';
import type { GetNewslettersParams, SendNewsletterPayload, SubscribeNewsletterPayload, UpdateNewsletterStatusPayload, NewslettersListResponse, NewsletterDetailResponse, NewsletterStatsResponse } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all subscribers
export const useGetAllSubscribers = (params: GetNewslettersParams = {}) => {
  return useQuery<NewslettersListResponse>({
    queryKey: ['newsletters', params],
    queryFn: async () => {
      const response = await newsletterAPI.getAllSubscribers(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single subscriber
export const useGetSubscriberById = (subscriberId: string) => {
  return useQuery<NewsletterDetailResponse>({
    queryKey: ['newsletter', subscriberId],
    queryFn: async () => {
      const response = await newsletterAPI.getSubscriberById(subscriberId);
      return response.data.data;
    },
    enabled: !!subscriberId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get subscription statistics
export const useGetSubscriptionStats = () => {
  return useQuery<NewsletterStatsResponse>({
    queryKey: ['newsletter-stats'],
    queryFn: async () => {
      const response = await newsletterAPI.getSubscriptionStats();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Subscribe to newsletter
export const useSubscribeNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation<NewsletterDetailResponse, Error, SubscribeNewsletterPayload>({
    mutationFn: async (payload: SubscribeNewsletterPayload) => {
      const response = await newsletterAPI.subscribeNewsletter(payload.email);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
      console.log('Newsletter subscription successful');
    },
    onError: (error: any) => {
      console.error('Subscribe newsletter error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Unsubscribe from newsletter
export const useUnsubscribeNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { token?: string; email?: string }>({
    mutationFn: async (params: { token?: string; email?: string }) => {
      const response = await newsletterAPI.unsubscribeNewsletter(params);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
      console.log('Newsletter unsubscription successful');
    },
    onError: (error: any) => {
      console.error('Unsubscribe newsletter error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Update subscriber status
export const useUpdateSubscriberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<NewsletterDetailResponse, Error, { subscriberId: string; statusData: UpdateNewsletterStatusPayload }>({
    mutationFn: async ({ subscriberId, statusData }: { subscriberId: string; statusData: UpdateNewsletterStatusPayload }) => {
      const response = await newsletterAPI.updateSubscriberStatus(subscriberId, statusData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', variables.subscriberId] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
      console.log('Subscriber status updated successfully');
    },
    onError: (error: any) => {
      console.error('Update subscriber status error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Delete subscriber
export const useDeleteSubscriber = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (subscriberId: string) => {
      const response = await newsletterAPI.deleteSubscriber(subscriberId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
      console.log('Subscriber deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete subscriber error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Send newsletter
export const useSendNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: number; failed: number }, Error, SendNewsletterPayload>({
    mutationFn: async (payload: SendNewsletterPayload) => {
      const response = await newsletterAPI.sendNewsletter(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
      console.log('Newsletter sent successfully');
    },
    onError: (error: any) => {
      console.error('Send newsletter error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};
