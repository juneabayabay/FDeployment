import { useQuery } from '@tanstack/react-query';
import { staffAppointmentsService, staffBillingService } from '../services';
import { QUERY_KEYS } from '../utils/constants';
import { unwrapList } from '../utils/formatters';
import { toApiDate } from '../utils/clinicDates';

const POLL_MS = 60_000;

export function useAdminDashboardStats(enabled = true) {
  const today = toApiDate(new Date());

  const schedule = useQuery({
    queryKey: QUERY_KEYS.staffSchedule(today),
    queryFn: async () => {
      const { data } = await staffAppointmentsService.getSchedule(today);
      return data;
    },
    enabled,
    refetchInterval: POLL_MS,
  });

  const pencilBookings = useQuery({
    queryKey: QUERY_KEYS.staffAppointments({ status: 'pencil_booked' }),
    queryFn: async () => {
      const { data } = await staffAppointmentsService.list({ status: 'pencil_booked' });
      return unwrapList(data);
    },
    enabled,
    refetchInterval: POLL_MS,
  });

  const waitingList = useQuery({
    queryKey: QUERY_KEYS.staffWaitingList(''),
    queryFn: async () => {
      const { data } = await staffAppointmentsService.getWaitingList();
      return unwrapList(data);
    },
    enabled,
    refetchInterval: POLL_MS,
  });

  const unpaidBilling = useQuery({
    queryKey: QUERY_KEYS.staffBilling({ payment_status: 'unpaid' }),
    queryFn: async () => {
      const { data } = await staffBillingService.list({ payment_status: 'unpaid' });
      return unwrapList(data);
    },
    enabled,
    refetchInterval: POLL_MS,
  });

  const partialBilling = useQuery({
    queryKey: QUERY_KEYS.staffBilling({ payment_status: 'partial' }),
    queryFn: async () => {
      const { data } = await staffBillingService.list({ payment_status: 'partial' });
      return unwrapList(data);
    },
    enabled,
    refetchInterval: POLL_MS,
  });

  const todayAppointments = schedule.data?.appointments || [];
  const pencilCount = (pencilBookings.data || []).length;
  const waitingCount = (waitingList.data || []).length;

  const outstandingRecords = [...(unpaidBilling.data || []), ...(partialBilling.data || [])];
  const outstandingBalance = outstandingRecords.reduce((sum, r) => sum + Number(r.balance || 0), 0);
  const collectedToday = todayAppointments.reduce((sum, a) => sum + Number(a.total_amount || 0), 0);

  const isLoading =
    schedule.isLoading ||
    pencilBookings.isLoading ||
    waitingList.isLoading ||
    unpaidBilling.isLoading ||
    partialBilling.isLoading;

  const refetch = () => {
    schedule.refetch();
    pencilBookings.refetch();
    waitingList.refetch();
    unpaidBilling.refetch();
    partialBilling.refetch();
  };

  return {
    today,
    todayCount: todayAppointments.length,
    pencilCount,
    waitingCount,
    outstandingBalance,
    outstandingRecordCount: outstandingRecords.length,
    collectedToday,
    isLoading,
    refetch,
  };
}
