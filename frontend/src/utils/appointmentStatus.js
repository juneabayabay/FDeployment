export function getStatusBadgeClass(status) {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    pencil_booked: 'bg-orange-100 text-orange-800',
    pencil: 'bg-orange-100 text-orange-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-slate-100 text-clinic-body',
    completed: 'bg-clinic-100 text-clinic-700',
    no_show: 'bg-red-100 text-red-800',
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
  };
  return map[status] || 'bg-slate-100 text-clinic-body';
}

export const APPOINTMENT_STATUS_LABELS = {
  pending: 'Pending',
  pencil_booked: 'Pencil Booked',
  pencil: 'Pencil Booked',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No Show',
};

export function getStatusLabel(status) {
  return APPOINTMENT_STATUS_LABELS[status] || status;
}

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid',
};

export function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS[status] || status;
}

export const BOOKING_SOURCE_LABELS = {
  online: 'Online',
  walk_in: 'Walk-in',
  emergency: 'Emergency',
};

export function getBookingSourceLabel(source) {
  return BOOKING_SOURCE_LABELS[source] || source;
}

export function getBookingSourceBadgeClass(source) {
  const map = {
    online: 'bg-clinic-100 text-clinic-700',
    walk_in: 'bg-violet-100 text-violet-800',
    emergency: 'bg-red-100 text-red-800',
  };
  return map[source] || 'bg-slate-100 text-clinic-body';
}

export function getStatusClass(status) {
  const map = {
    pending: 'pending',
    pencil_booked: 'pencil',
    pencil: 'pencil',
    confirmed: 'confirmed',
    cancelled: 'cancelled',
    completed: 'completed',
    no_show: 'no_show',
  };
  return map[status] || 'default';
}
