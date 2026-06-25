import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffAppointmentsService } from '../services';
import { QUERY_KEYS } from '../utils/constants';

export function useStaffAppointments(params = {}, { enabled = true } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.staffAppointments(params),
    queryFn: async () => {
      const { data } = await staffAppointmentsService.list(params);
      return data;
    },
    enabled,
  });
}

export function useStaffSchedule(date) {
  return useQuery({
    queryKey: QUERY_KEYS.staffSchedule(date),
    queryFn: async () => {
      const { data } = await staffAppointmentsService.getSchedule(date);
      return data;
    },
    enabled: Boolean(date),
  });
}

export function useStaffWaitingList(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.staffWaitingList(params),
    queryFn: async () => {
      const { data } = await staffAppointmentsService.getWaitingList(params);
      return data;
    },
  });
}

export function useCreateStaffAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => staffAppointmentsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['staff-billing'] });
    },
  });
}

export function useUpdateStaffAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => staffAppointmentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] });
    },
  });
}

export function useCancelStaffAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => staffAppointmentsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] });
    },
  });
}

export function useRescheduleStaffAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => staffAppointmentsService.reschedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] });
    },
  });
}

export function useDeactivateStaffWaitingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => staffAppointmentsService.deactivateWaitingList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-waiting-list'] });
    },
  });
}

export function useBookStaffWaitingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => staffAppointmentsService.bookWaitingList(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-waiting-list'] });
      queryClient.invalidateQueries({ queryKey: ['staff-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] });
    },
  });
}
