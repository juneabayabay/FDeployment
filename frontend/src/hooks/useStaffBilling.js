import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffBillingService } from '../services';
import { QUERY_KEYS } from '../utils/constants';

export function useStaffBilling(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.staffBilling(params),
    queryFn: async () => {
      const { data } = await staffBillingService.list(params);
      return data;
    },
    enabled,
  });
}

export function useCreateStaffBilling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => staffBillingService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-billing'] }),
  });
}

export function useUpdateStaffBilling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => staffBillingService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-billing'] }),
  });
}
