import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dentistsService } from '../services/dentists.service';
import { QUERY_KEYS } from '../utils/constants';

export function useDentistDirectory(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.dentistDirectory(params),
    queryFn: () => dentistsService.listDirectory(params),
  });
}

export function useDentistProfiles(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.dentistProfiles(params),
    queryFn: () => dentistsService.listProfiles(params),
  });
}

export function useMyDentistProfile(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.myDentistProfile,
    queryFn: async () => {
      const { data } = await dentistsService.getMyProfile();
      return data;
    },
    enabled,
  });
}

export function useUpdateMyDentistProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => dentistsService.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myDentistProfile });
      queryClient.invalidateQueries({ queryKey: ['dentist-directory'] });
      queryClient.invalidateQueries({ queryKey: ['dentist-profiles'] });
    },
  });
}

export function useUpdateDentistProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => dentistsService.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentist-directory'] });
      queryClient.invalidateQueries({ queryKey: ['dentist-profiles'] });
    },
  });
}

export function useCreateDentistProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => dentistsService.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentist-directory'] });
      queryClient.invalidateQueries({ queryKey: ['dentist-profiles'] });
    },
  });
}
