import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../api';
import type { GetNotificationsParams, SendNotificationPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get notifications
export const useGetNotifications = (params: GetNotificationsParams = {}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await notificationAPI.getNotifications(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get unread count
export const useGetUnreadNotificationCount = () => {
  return useQuery({
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
export const useGetUnreadNotifications = () => {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const response = await notificationAPI.getUnreadNotifications();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get notifications by category
export const useGetNotificationsByCategory = (category: string) => {
  return useQuery({
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

  return useMutation({
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
      const errorMessage = error.response?.data?.message || 'Failed to send notification';
      console.error('Error:', errorMessage);
    },
  });
};

// Mark notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
      const errorMessage = error.response?.data?.message || 'Failed to mark notification as read';
      console.error('Error:', errorMessage);
    },
  });
};

// Mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
      const errorMessage = error.response?.data?.message || 'Failed to mark all notifications as read';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
      const errorMessage = error.response?.data?.message || 'Failed to delete notification';
      console.error('Error:', errorMessage);
    },
  });
};
