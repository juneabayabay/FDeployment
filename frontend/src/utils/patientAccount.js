const WALK_IN_EMAIL_DOMAIN = '@patients.barnabas.local';

export function isWalkInAccount(patient) {
  return Boolean(patient?.is_walk_in_account);
}

export function formatPatientEmail(patient) {
  if (!patient?.email) return '—';
  if (isWalkInAccount(patient) && patient.email.toLowerCase().includes(WALK_IN_EMAIL_DOMAIN)) {
    return 'No portal email';
  }
  return patient.email;
}

export function formatPatientOptionLabel(patient) {
  const name =
    patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Patient';
  const phone = patient.phone ? ` · ${patient.phone}` : '';
  const walkIn = isWalkInAccount(patient) ? ' · Walk-in' : '';
  return `${name}${phone}${walkIn}`;
}
