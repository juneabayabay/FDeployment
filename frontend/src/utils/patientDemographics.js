export function needsEmailVerification(user) {
  return Boolean(user?.email_verification_required);
}

export const SEX_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const CIVIL_STATUS_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export function formatSex(value) {
  return SEX_OPTIONS.find((o) => o.value === value)?.label || '—';
}

export function formatCivilStatus(value) {
  return CIVIL_STATUS_OPTIONS.find((o) => o.value === value)?.label || '—';
}
