export function parseApiDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toApiDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getNextClinicDay(from = new Date()) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i += 1) {
    if (d.getDay() !== 0 && d >= new Date().setHours(0, 0, 0, 0)) {
      return d;
    }
    d.setDate(d.getDate() + 1);
  }
  return d;
}
