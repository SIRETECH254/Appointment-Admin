import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewAPI } from '../api';
import type { CreateReviewPayload, GetReviewsParams, UpdateReviewPayload, UpdateReviewStatusPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all reviews
export const useGetAllReviews = (params: GetReviewsParams = {}) => {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: async () => {
      const response = await reviewAPI.getAllReviews(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single review
export const useGetReviewById = (reviewId: string) => {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      const response = await reviewAPI.getReview(reviewId);
      return response.data.data;
    },
    enabled: !!reviewId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Create review
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: CreateReviewPayload) => {
      const response = await reviewAPI.createReview(reviewData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      console.log('Review created successfully');
    },
    onError: (error: any) => {
      console.error('Create review error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create review';
      console.error('Error:', errorMessage);
    },
  });
};

// Update review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, reviewData }: { reviewId: string; reviewData: UpdateReviewPayload }) => {
      const response = await reviewAPI.updateReview(reviewId, reviewData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', variables.reviewId] });
      console.log('Review updated successfully');
    },
    onError: (error: any) => {
      console.error('Update review error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update review';
      console.error('Error:', errorMessage);
    },
  });
};

// Delete review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await reviewAPI.deleteReview(reviewId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      console.log('Review deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete review error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete review';
      console.error('Error:', errorMessage);
    },
  });
};

// Update review status (admin only)
export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, statusData }: { reviewId: string; statusData: UpdateReviewStatusPayload }) => {
      const response = await reviewAPI.updateReviewStatus(reviewId, statusData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', variables.reviewId] });
      console.log('Review status updated successfully');
    },
    onError: (error: any) => {
      console.error('Update review status error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update review status';
      console.error('Error:', errorMessage);
    },
  });
};
