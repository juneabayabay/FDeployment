import { useQuery } from '@tanstack/react-query';
import { billingService } from '../services';
import { QUERY_KEYS } from '../utils/constants';
import { unwrapList } from '../utils/formatters';

export function useBilling() {
  return useQuery({
    queryKey: QUERY_KEYS.billing,
    queryFn: async () => {
      const { data } = await billingService.list();
      return unwrapList(data);
    },
  });
}
