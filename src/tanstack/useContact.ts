import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactAPI } from '../api';
import type { GetContactsParams, ReplyToContactPayload, SubmitContactPayload, UpdateContactStatusPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Submit contact message
export const useSubmitContactMessage = () => {
  return useMutation({
    mutationFn: async (messageData: SubmitContactPayload) => {
      const response = await contactAPI.submitMessage(messageData);
      return response.data.data;
    },
    onSuccess: () => {
      console.log('Contact message submitted successfully');
    },
    onError: (error: any) => {
      console.error('Submit contact message error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit contact message';
      console.error('Error:', errorMessage);
    },
  });
};

// Get all contact messages
export const useGetAllContactMessages = (params: GetContactsParams = {}) => {
  return useQuery({
    queryKey: ['contact', 'messages', params],
    queryFn: async () => {
      const response = await contactAPI.getAllMessages(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single contact message
export const useGetContactMessageById = (contactId: string) => {
  return useQuery({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      const response = await contactAPI.getMessage(contactId);
      return response.data.data;
    },
    enabled: !!contactId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update contact status
export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, statusData }: { contactId: string; statusData: UpdateContactStatusPayload }) => {
      const response = await contactAPI.updateStatus(contactId, statusData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contact', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['contact', variables.contactId] });
      console.log('Contact status updated successfully');
    },
    onError: (error: any) => {
      console.error('Update contact status error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update contact status';
      console.error('Error:', errorMessage);
    },
  });
};

// Reply to contact message
export const useReplyToContactMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, replyData }: { contactId: string; replyData: ReplyToContactPayload }) => {
      const response = await contactAPI.replyToMessage(contactId, replyData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contact', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['contact', variables.contactId] });
      console.log('Contact reply sent successfully');
    },
    onError: (error: any) => {
      console.error('Reply to contact error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reply to contact message';
      console.error('Error:', errorMessage);
    },
  });
};
