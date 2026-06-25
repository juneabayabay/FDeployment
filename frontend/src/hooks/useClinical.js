import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clinicalService } from '../services';
import { QUERY_KEYS } from '../utils/constants';
import { unwrapList } from '../utils/formatters';

export function usePatientTreatments(patientId, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.patientTreatments(patientId),
    queryFn: async () => {
      const { data } = await clinicalService.listTreatments(patientId);
      return unwrapList(data);
    },
    enabled: Boolean(patientId) && enabled,
  });
}

export function usePatientOrthodontic(patientId, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.patientOrthodontic(patientId),
    queryFn: async () => {
      const { data } = await clinicalService.listOrthodontic(patientId);
      return unwrapList(data);
    },
    enabled: Boolean(patientId) && enabled,
  });
}

export function usePatientSurgical(patientId, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.patientSurgical(patientId),
    queryFn: async () => {
      const { data } = await clinicalService.listSurgical(patientId);
      return unwrapList(data);
    },
    enabled: Boolean(patientId) && enabled,
  });
}

export function useCreateTreatment(patientId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => clinicalService.createTreatment(patientId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientTreatments(patientId) }),
  });
}

export function useCreateSurgical(patientId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => clinicalService.createSurgical(patientId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientSurgical(patientId) }),
  });
}

export function useCreateOrthodontic(patientId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => clinicalService.createOrthodontic(patientId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientOrthodontic(patientId) }),
  });
}

export function useUpdateTreatment(patientId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => clinicalService.updateTreatment(patientId, id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientTreatments(patientId) }),
  });
}

export function useUpdateOrthodontic(patientId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => clinicalService.updateOrthodontic(patientId, id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientOrthodontic(patientId) }),
  });
}

export function useUpdateSurgical(patientId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => clinicalService.updateSurgical(patientId, id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientSurgical(patientId) }),
  });
}

export function useDeleteTreatment(patientId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => clinicalService.deleteTreatment(patientId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientTreatments(patientId) }),
  });
}

export function useDeleteOrthodontic(patientId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => clinicalService.deleteOrthodontic(patientId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientOrthodontic(patientId) }),
  });
}

export function useDeleteSurgical(patientId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => clinicalService.deleteSurgical(patientId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientSurgical(patientId) }),
  });
}
