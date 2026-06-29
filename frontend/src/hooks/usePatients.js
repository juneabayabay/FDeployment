import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientsService } from '../services';
import { QUERY_KEYS } from '../utils/constants';
import { unwrapList } from '../utils/formatters';

export function usePatients(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.patients(params),
    queryFn: async () => {
      const { data } = await patientsService.list(params);
      return data;
    },
  });
}

export function usePatientList(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.patients(params),
    queryFn: async () => {
      const { data } = await patientsService.list(params);
      return unwrapList(data);
    },
  });
}

export function usePatient(id) {
  return useQuery({
    queryKey: QUERY_KEYS.patient(id),
    queryFn: async () => {
      const { data } = await patientsService.get(id);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => patientsService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  });
}

export function useCreateWalkInPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => patientsService.createWalkIn(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => patientsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patient(id) });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => patientsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  });
}
