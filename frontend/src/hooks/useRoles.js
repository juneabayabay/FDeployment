import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '../services';
import { QUERY_KEYS } from '../utils/constants';
import { unwrapList } from '../utils/formatters';

export function useRoles() {
  return useQuery({
    queryKey: QUERY_KEYS.roles,
    queryFn: async () => {
      const { data } = await rolesService.list();
      return unwrapList(data);
    },
  });
}

export function useRole(id) {
  return useQuery({
    queryKey: QUERY_KEYS.role(id),
    queryFn: async () => {
      const { data } = await rolesService.get(id);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: QUERY_KEYS.permissions,
    queryFn: async () => {
      const { data } = await rolesService.listPermissions();
      return unwrapList(data);
    },
  });
}

export function useRolePermissions(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.rolePermissions(params),
    queryFn: async () => {
      const { data } = await rolesService.listRolePermissions(params);
      return unwrapList(data);
    },
  });
}

export function useAssignPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => rolesService.assignPermission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
    },
  });
}

export function useRemovePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => rolesService.removePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
    },
  });
}
