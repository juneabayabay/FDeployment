export const ROLES = {
  ADMIN: 'admin',
  DENTIST: 'dentist',
  RECEPTIONIST: 'receptionist',
  USER: 'user',
};

export const STAFF_ROLES = [ROLES.ADMIN, ROLES.DENTIST, ROLES.RECEPTIONIST];

export const DASHBOARD_PATHS = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.DENTIST]: '/dentist/dashboard',
  [ROLES.RECEPTIONIST]: '/receptionist/dashboard',
  [ROLES.USER]: '/patient/dashboard',
};

export const STAFF_ROUTE_PREFIX = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.DENTIST]: '/dentist',
  [ROLES.RECEPTIONIST]: '/receptionist',
};

export const LOGIN_PATHS = {
  [ROLES.USER]: '/login',
  [ROLES.ADMIN]: '/admin',
  [ROLES.DENTIST]: '/dentist',
  [ROLES.RECEPTIONIST]: '/receptionist',
};

export const APP_NAME = 'Barnabas Dental Clinic';

export const LOGIN_PORTALS = [
  {
    role: ROLES.USER,
    path: LOGIN_PATHS[ROLES.USER],
    altPath: '/login',
    title: 'Patient',
    description: 'Book appointments and view your records',
  },
  {
    role: ROLES.ADMIN,
    path: LOGIN_PATHS[ROLES.ADMIN],
    title: 'Administrator',
    description: 'Manage clinic, users, and settings',
  },
  {
    role: ROLES.DENTIST,
    path: LOGIN_PATHS[ROLES.DENTIST],
    title: 'Dentist',
    description: 'Clinical workspace for treatments and patients',
  },
  {
    role: ROLES.RECEPTIONIST,
    path: LOGIN_PATHS[ROLES.RECEPTIONIST],
    title: 'Receptionist',
    description: 'Front desk, booking, and patient registration',
  },
];

export const RECEPTIONIST_NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', permission: null },
  { path: '/schedule', label: 'Schedule', permission: 'appointments.view' },
  { path: '/appointments', label: 'Appointments', permission: 'appointments.view' },
  { path: '/appointments/book', label: 'Book Appointment', permission: 'appointments.create' },
  { path: '/patients', label: 'Patients', permission: 'patients.view' },
  { path: '/billing', label: 'Billing', permission: 'billing.view' },
  { path: '/waiting-list', label: 'Waiting List', permission: 'appointments.view' },
  { path: '/dentists', label: 'Dentist Directory', permission: 'dentists.view' },
  { path: '/users', label: 'Manage Accounts', permission: 'users.view' },
  {
    path: '/users/create-staff',
    label: 'Add Staff',
    permission: 'users.create',
  },
  { path: '/roles', label: 'Roles', permission: 'roles.view' },
  { path: '/permissions', label: 'Permissions', permission: 'permissions.view' },
];

/** @deprecated Use RECEPTIONIST_NAV_ITEMS */
export const STAFF_NAV_ITEMS = RECEPTIONIST_NAV_ITEMS;

/** Dentist clinical portal sidebar */
export const DENTIST_NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', permission: null },
  { path: '/schedule', label: "Today's Schedule", permission: 'appointments.view' },
  { path: '/appointments', label: 'Appointments', permission: 'appointments.view' },
  { path: '/patients', label: 'Patient Records', permission: 'patients.view' },
  { path: '/profile', label: 'My profile', permission: null },
  { path: '/braces-approvals', label: 'Braces Approvals', permission: 'billing.approve' },
  { path: '/reports', label: 'Reports', permission: 'reports.view' },
];

/** Admin portal sidebar */
export const ADMIN_NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', permission: null },
  { path: '/appointments', label: 'Appointments', permission: 'appointments.view' },
  { path: '/schedule', label: 'Daily Schedule', permission: 'appointments.view' },
  { path: '/appointments/book', label: 'Book Appointment', permission: 'appointments.create' },
  { path: '/patients', label: 'Patient Records', permission: 'patients.view' },
  { path: '/dentists', label: 'Dentist Directory', permission: 'dentists.view' },
  { path: '/billing', label: 'Billing', permission: 'billing.view' },
  { path: '/braces-approvals', label: 'Braces Approvals', permission: 'billing.approve' },
  { path: '/waiting-list', label: 'Waiting List', permission: 'appointments.view' },
  { path: '/reports', label: 'Reports', permission: 'reports.view' },
  { path: '/users', label: 'Manage Accounts', permission: 'users.view' },
  {
    path: '/users/create-staff',
    label: 'Add Staff',
    permission: 'users.create',
  },
  { path: '/roles', label: 'Roles', permission: 'roles.view' },
  { path: '/permissions', label: 'Permissions', permission: 'permissions.view' },
  { path: '/settings', label: 'System Settings', permission: 'settings.view' },
  { path: '/audit-logs', label: 'Audit Logs', permission: 'audit.view' },
];

/** @deprecated Use RECEPTIONIST_NAV_ITEMS or role-specific nav */
export const NAV_ITEMS = RECEPTIONIST_NAV_ITEMS;

export function getNavItemsForPrefix(basePath) {
  if (basePath === '/admin') return ADMIN_NAV_ITEMS;
  if (basePath === '/dentist') return DENTIST_NAV_ITEMS;
  return RECEPTIONIST_NAV_ITEMS;
}

export function getPortalLabel(basePath) {
  if (basePath === '/admin') return 'Admin Portal';
  if (basePath === '/dentist') return 'Dentist Portal';
  return 'Staff Portal';
}

export const APPOINTMENT_STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'pencil_booked', label: 'Pencil Booked' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
];

export const PAYMENT_STATUS_FILTERS = [
  { value: '', label: 'All payments' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
];

export const PATIENT_NAV_ITEMS = [
  { path: '/patient/dashboard', label: 'Dashboard', icon: 'home' },
  { path: '/patient/book', label: 'Book', icon: 'calendar-plus' },
  { path: '/patient/dentists', label: 'Dentists', icon: 'user-md' },
  { path: '/patient/calendar', label: 'Calendar', icon: 'calendar' },
  { path: '/patient/appointments', label: 'Appointments', icon: 'clipboard' },
  { path: '/patient/billing', label: 'Billing', icon: 'credit-card' },
  { path: '/patient/waiting-list', label: 'Waiting List', icon: 'clock' },
  { path: '/patient/notifications', label: 'Notifications', icon: 'bell', badge: true },
  { path: '/patient/profile', label: 'Profile', icon: 'user' },
];

export const PATIENT_BOTTOM_NAV = [
  { path: '/patient/dashboard', label: 'Home', icon: 'home' },
  { path: '/patient/book', label: 'Book', icon: 'calendar-plus' },
  { path: '/patient/appointments', label: 'Appts', icon: 'clipboard' },
  { path: '/patient/billing', label: 'Billing', icon: 'credit-card' },
  { path: 'more', label: 'More', icon: 'menu' },
];

export const PATIENT_MORE_NAV = [
  { path: '/patient/calendar', label: 'Calendar', icon: 'calendar' },
  { path: '/patient/dentists', label: 'Dentists', icon: 'user-md' },
  { path: '/patient/waiting-list', label: 'Waiting List', icon: 'clock' },
  { path: '/patient/notifications', label: 'Notifications', icon: 'bell', badge: true },
  { path: '/patient/profile', label: 'Profile', icon: 'user' },
];

export const QUERY_KEYS = {
  users: (params) => ['users', params],
  user: (id) => ['users', id],
  userRoles: (params) => ['user-roles', params],
  roles: ['roles'],
  role: (id) => ['roles', id],
  permissions: ['permissions'],
  rolePermissions: (params) => ['role-permissions', params],
  clinicInfo: ['clinic-info'],
  procedures: ['procedures'],
  procedurePackages: ['procedure-packages'],
  appointments: (status) => ['appointments', status],
  appointment: (id) => ['appointments', 'detail', id],
  compatibleSlots: (ids, date, packageId) => ['slots', 'compatible', ids, date, packageId],
  slots: (date, duration) => ['slots', date, duration],
  waitingList: ['waiting-list'],
  billing: ['billing'],
  notifications: ['notifications'],
  staffAppointments: (params) => ['staff-appointments', params],
  staffSchedule: (date) => ['staff-schedule', date],
  staffSlots: (date, duration) => ['staff-slots', date, duration],
  staffWaitingList: (params) => ['staff-waiting-list', params],
  staffBilling: (params) => ['staff-billing', params],
  patients: (params) => ['patients', params],
  patient: (id) => ['patients', id],
  dashboardStats: ['dashboard-stats'],
  reports: (params) => ['reports', params],
  clinicSettings: ['clinic-settings'],
  emailSettings: ['email-settings'],
  staffProcedures: ['staff-procedures'],
  staffProcedurePackages: ['staff-procedure-packages'],
  auditLogs: (params) => ['audit-logs', params],
  downPayments: (params) => ['down-payments', params],
  patientTreatments: (id) => ['patient-treatments', id],
  patientOrthodontic: (id) => ['patient-orthodontic', id],
  patientSurgical: (id) => ['patient-surgical', id],
  patientPrescriptions: (id) => ['patient-prescriptions', id],
  dentistDirectory: (params) => ['dentist-directory', params],
  dentistProfiles: (params) => ['dentist-profiles', params],
  myDentistProfile: ['my-dentist-profile'],
};
