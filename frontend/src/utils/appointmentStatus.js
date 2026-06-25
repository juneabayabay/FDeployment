export function getStatusBadgeClass(status) {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    pencil_booked: 'bg-orange-100 text-orange-800',
    pencil: 'bg-orange-100 text-orange-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-slate-100 text-slate-600',
    completed: 'bg-sky-100 text-sky-800',
    no_show: 'bg-red-100 text-red-800',
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
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
