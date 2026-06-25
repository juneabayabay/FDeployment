import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '../services';
import { QUERY_KEYS } from '../utils/constants';

export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: async () => {
      const { data } = await reportsService.getDashboardStats();
      return data;
    },
    enabled,
    refetchInterval: 60_000,
  });
}

export function useReports(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.reports(params),
    queryFn: async () => {
      const { data } = await reportsService.getReports(params);
      return data;
    },
  });
}
