import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services';
import { QUERY_KEYS } from '../utils/constants';
import { unwrapList } from '../utils/formatters';

export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: async () => {
      const { data } = await notificationsService.list();
      return unwrapList(data);
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationsService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications }),
  });
}
