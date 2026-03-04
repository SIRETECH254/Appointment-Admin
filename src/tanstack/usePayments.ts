import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentAPI } from '../api';
import type { GetPaymentsParams, InitiatePaymentPayload, ServicePaymentPayload, PaymentsListResponse, PaymentDetailResponse, InitiatePaymentResponse, QueryMpesaStatusResponse } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all payments
export const useGetAllPayments = (params: GetPaymentsParams = {}) => {
  return useQuery<PaymentsListResponse>({
    queryKey: ['payments', params],
    queryFn: async () => {
      const response = await paymentAPI.getAllPayments(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single payment
export const useGetPaymentById = (paymentId: string) => {
  return useQuery<PaymentDetailResponse>({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      const response = await paymentAPI.getPayment(paymentId);
      return response.data.data;
    },
    enabled: !!paymentId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Initiate payment
export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation<InitiatePaymentResponse, Error, InitiatePaymentPayload>({
    mutationFn: async (paymentData: InitiatePaymentPayload) => {
      const response = await paymentAPI.initiatePayment(paymentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Payment initiated successfully');
    },
    onError: (error: any) => {
      console.error('Initiate payment error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Service payment
export const useServicePayment = () => {
  const queryClient = useQueryClient();

  return useMutation<PaymentDetailResponse, Error, ServicePaymentPayload>({
    mutationFn: async (paymentData: ServicePaymentPayload) => {
      const response = await paymentAPI.servicePayment(paymentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Service payment completed successfully');
    },
    onError: (error: any) => {
      console.error('Service payment error:', error);
      const errorMessage = error.response?.data?.message;
      console.error('Error:', errorMessage);
    },
  });
};

// Query M-Pesa payment status (for fallback query)
// Backend endpoint: GET /api/payments/status/:checkoutRequestId
// Returns: { success: true, data: { payment: {...}, status: { ok, resultCode, resultDesc, error, details } } }
export const useQueryMpesaStatus = (checkoutRequestId: string, options?: { enabled?: boolean }) => {
  return useQuery<{ payment: any; status: QueryMpesaStatusResponse }>({
    queryKey: ['payment', 'mpesa-status', checkoutRequestId],
    queryFn: async () => {
      const response = await paymentAPI.queryMpesaStatus(checkoutRequestId);
      return response.data.data;
    },
    enabled: (options?.enabled ?? false) && !!checkoutRequestId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};
