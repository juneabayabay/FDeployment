import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from '../services';
import { QUERY_KEYS } from '../utils/constants';
import { unwrapList } from '../utils/formatters';

export function useClinicInfo() {
  return useQuery({
    queryKey: QUERY_KEYS.clinicInfo,
    queryFn: async () => {
      const { data } = await appointmentsService.getClinicInfo();
      return data;
    },
  });
}

export function useProcedures() {
  return useQuery({
    queryKey: QUERY_KEYS.procedures,
    queryFn: async () => {
      const { data } = await appointmentsService.getProcedures();
      return data;
    },
  });
}

export function useProcedurePackages() {
  return useQuery({
    queryKey: QUERY_KEYS.procedurePackages,
    queryFn: async () => {
      const { data } = await appointmentsService.getProcedurePackages();
      return data;
    },
  });
}

export function useAppointments(status) {
  return useQuery({
    queryKey: QUERY_KEYS.appointments(status),
    queryFn: async () => {
      const { data } = await appointmentsService.list(status ? { status } : {});
      return unwrapList(data);
    },
  });
}

export function useCompatibleSlots(procedureIds, date, packageId = null) {
  return useQuery({
    queryKey: QUERY_KEYS.compatibleSlots(procedureIds, date, packageId),
    queryFn: async () => {
      const { data } = await appointmentsService.getCompatibleSlots(
        procedureIds,
        date,
        packageId
      );
      return data;
    },
    enabled: procedureIds.length > 0 || Boolean(packageId),
  });
}

export function useSlots(date, durationMinutes, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.slots(date, durationMinutes),
    queryFn: async () => {
      const { data } = await appointmentsService.getSlots(date, durationMinutes);
      return data;
    },
    enabled: Boolean(date) && durationMinutes > 0 && enabled,
  });
}

export function useWaitingList() {
  return useQuery({
    queryKey: QUERY_KEYS.waitingList,
    queryFn: async () => {
      const { data } = await appointmentsService.getWaitingList();
      return data;
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => appointmentsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.billing });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => appointmentsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['staff-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.billing });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => appointmentsService.reschedule(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
}

export function useJoinWaitingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => appointmentsService.joinWaitingList(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.waitingList }),
  });
}

export function useLeaveWaitingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => appointmentsService.leaveWaitingList(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.waitingList }),
  });
}
