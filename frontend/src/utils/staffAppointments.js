export const RESCHEDULABLE_STATUSES = ['pending', 'pencil_booked', 'confirmed'];

export const STAFF_STATUS_OPTIONS = ['pending', 'pencil_booked', 'confirmed', 'no_show'];

export function canRescheduleAppointment(appointment) {
  return RESCHEDULABLE_STATUSES.includes(appointment?.status);
}

export function canActOnAppointment(appointment) {
  return appointment?.status !== 'cancelled' && appointment?.status !== 'completed';
}
