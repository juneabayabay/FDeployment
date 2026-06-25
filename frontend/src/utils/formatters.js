export function formatPrice(price) {
  return `₱${Number(price).toLocaleString()}`;
}

export function formatDuration(minutes) {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return hrs === 1 ? '1 hour' : `${hrs} hours`;
  return `${hrs} hr ${mins} min`;
}

export function formatDurationShort(minutes) {
  if (minutes < 60) return `${minutes}min`;
  const hours = minutes / 60;
  return hours === 1 ? '1hr' : `${hours}hrs`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(`${dateStr}T00:00:00`) : dateStr;
  return date.toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleString('en-PH');
}

export function parseApiError(error) {
  const data = error?.response?.data;
  if (!data) return error?.message || 'An unexpected error occurred.';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.non_field_errors) return data.non_field_errors.join(' ');
  return Object.entries(data)
    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
    .join('; ');
}

export function unwrapList(data) {
  return data?.results ?? data ?? [];
}
