import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { downPaymentsService } from '../services';
import { QUERY_KEYS } from '../utils/constants';
import { unwrapList } from '../utils/formatters';

export function useDownPayments(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.downPayments(params),
    queryFn: async () => {
      const { data } = await downPaymentsService.list(params);
      return unwrapList(data);
    },
  });
}

export function useCreateDownPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => downPaymentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['down-payments'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    },
  });
}

export function useApproveDownPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => downPaymentsService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['down-payments'] });
      queryClient.invalidateQueries({ queryKey: ['staff-billing'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    },
  });
}

export function useRejectDownPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => downPaymentsService.reject(id, { rejection_reason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['down-payments'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    },
  });
}
