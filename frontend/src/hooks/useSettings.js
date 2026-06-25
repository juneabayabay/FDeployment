import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services';
import { QUERY_KEYS } from '../utils/constants';
import { unwrapList } from '../utils/formatters';

export function useClinicSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.clinicSettings,
    queryFn: async () => {
      const { data } = await settingsService.getClinicSettings();
      return data;
    },
  });
}

export function useUpdateClinicSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => settingsService.patchClinicSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clinicSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clinicInfo });
    },
  });
}

export function useEmailSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.emailSettings,
    queryFn: async () => {
      const { data } = await settingsService.getEmailSettings();
      return data;
    },
  });
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => settingsService.patchEmailSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.emailSettings });
    },
  });
}

export function useTestEmailSettings() {
  return useMutation({
    mutationFn: (email) => settingsService.testEmailSettings(email),
  });
}

export function useStaffProcedures() {
  return useQuery({
    queryKey: QUERY_KEYS.staffProcedures,
    queryFn: async () => {
      const { data } = await settingsService.getProcedures();
      return unwrapList(data);
    },
  });
}

export function useCreateStaffProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => settingsService.createProcedure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staffProcedures });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.procedures });
    },
  });
}

export function useUpdateStaffProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => settingsService.updateProcedure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staffProcedures });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.procedures });
    },
  });
}
