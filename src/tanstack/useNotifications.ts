import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../api';
import type { GetNotificationsParams, SendNotificationPayload, SendBulkNotificationPayload, NotificationPaginationResponse, NotificationDetailResponse, UnreadCountResponse, UnreadNotificationsResponse } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get notifications
export const useGetNotifications = (params: GetNotificationsParams = {}) => {
  return useQuery<NotificationPaginationResponse>({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await notificationAPI.getNotifications(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single notification
export const useGetNotification = (notificationId: string) => {
  return useQuery<NotificationDetailResponse>({
    queryKey: ['notifications', notificationId],
    queryFn: async () => {
      const response = await notificationAPI.getNotification(notificationId);
      return response.data.data;
    },
    enabled: !!notificationId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get unread count
export const useGetUnreadNotificationCount = () => {
  return useQuery<UnreadCountResponse>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await notificationAPI.getUnreadCount();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get unread notifications
export const useGetUnreadNotifications = (params?: { limit?: number }) => {
  return useQuery<UnreadNotificationsResponse>({
    queryKey: ['notifications', 'unread', params],
    queryFn: async () => {
      const response = await notificationAPI.getUnreadNotifications(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get notifications by category
export const useGetNotificationsByCategory = (category: string) => {
  return useQuery<NotificationPaginationResponse>({
    queryKey: ['notifications', 'category', category],
    queryFn: async () => {
      const response = await notificationAPI.getNotificationsByCategory(category);
      return response.data.data;
    },
    enabled: !!category,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Send notification
export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<NotificationDetailResponse, Error, SendNotificationPayload>({
    mutationFn: async (notificationData: SendNotificationPayload) => {
      const response = await notificationAPI.sendNotification(notificationData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      console.log('Notification sent successfully');
    },
    onError: (error: any) => {
      console.error('Send notification error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Mark notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<NotificationDetailResponse, Error, string>({
    mutationFn: async (notificationId: string) => {
      const response = await notificationAPI.markAsRead(notificationId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      console.log('Notification marked as read');
    },
    onError: (error: any) => {
      console.error('Mark as read error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<{ count: number }, Error, void>({
    mutationFn: async () => {
      const response = await notificationAPI.markAllAsRead();
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      console.log('All notifications marked as read');
    },
    onError: (error: any) => {
      console.error('Mark all as read error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (notificationId: string) => {
      const response = await notificationAPI.deleteNotification(notificationId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      console.log('Notification deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete notification error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Send bulk notification
export const useSendBulkNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: number; failed: number }, Error, SendBulkNotificationPayload>({
    mutationFn: async (bulkData: SendBulkNotificationPayload) => {
      const response = await notificationAPI.sendBulkNotification(bulkData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      console.log('Bulk notification sent successfully');
    },
    onError: (error: any) => {
      console.error('Send bulk notification error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};
