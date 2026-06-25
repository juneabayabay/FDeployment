import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services';
import { QUERY_KEYS } from '../utils/constants';
import { unwrapList } from '../utils/formatters';

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.auditLogs(params),
    queryFn: async () => {
      const { data } = await auditService.list(params);
      return data;
    },
  });
}

export function useAuditLogList(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.auditLogs(params),
    queryFn: async () => {
      const { data } = await auditService.list(params);
      return unwrapList(data);
    },
  });
}
