import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services';
import { QUERY_KEYS } from '../utils/constants';
import { unwrapList } from '../utils/formatters';

export function useUsers(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.users(params),
    queryFn: async () => {
      const { data } = await usersService.list(params);
      return data;
    },
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: async () => {
      const { data } = await usersService.get(id);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useUserRoles(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.userRoles(params),
    queryFn: async () => {
      const { data } = await usersService.listUserRoles(params);
      return unwrapList(data);
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => usersService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => usersService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id) => usersService.resetPassword(id),
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => usersService.assignRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersService.removeRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
