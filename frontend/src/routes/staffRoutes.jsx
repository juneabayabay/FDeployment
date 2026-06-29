import { Route } from 'react-router-dom';
import StaffLayout from '../layouts/StaffLayout';
import StaffDashboardPage from '../pages/dashboard/StaffDashboardPage';
import PatientListPage from '../pages/patients/PatientListPage';
import PermissionListPage from '../pages/permissions/PermissionListPage';
import ChangePasswordPage from '../pages/profile/ChangePasswordPage';
import ProfilePage from '../pages/profile/ProfilePage';
import RoleListPage from '../pages/roles/RoleListPage';
import RolePermissionsPage from '../pages/roles/RolePermissionsPage';
import CreateReceptionistPage from '../pages/users/CreateReceptionistPage';
import CreateStaffPage from '../pages/users/CreateStaffPage';
import UserDetailPage from '../pages/users/UserDetailPage';
import UserListPage from '../pages/users/UserListPage';
import ReceptionistAppointmentsPage from '../pages/receptionist/AppointmentsPage';
import ReceptionistBookPage from '../pages/receptionist/BookAppointmentPage';
import ReceptionistBillingPage from '../pages/receptionist/BillingPage';
import ReceptionistSchedulePage from '../pages/receptionist/SchedulePage';
import ReceptionistWaitingListPage from '../pages/receptionist/WaitingListPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminDentistDirectoryPage from '../pages/admin/AdminDentistDirectoryPage';
import AdminPatientDetailPage from '../pages/admin/AdminPatientDetailPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import SystemSettingsPage from '../pages/admin/SystemSettingsPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';
import BracesApprovalPage from '../pages/admin/BracesApprovalPage';
import DentistDashboardPage from '../pages/dentist/DentistDashboardPage';
import DentistPatientDetailPage from '../pages/dentist/DentistPatientDetailPage';
import DentistReportsPage from '../pages/dentist/DentistReportsPage';
import PermissionRoute from './PermissionRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import { ROLES } from '../utils/constants';

function dentistPageRoutes(prefix) {
  return (
    <>
      <Route path={`${prefix}/dashboard`} element={<DentistDashboardPage />} />
      <Route path={`${prefix}/profile`} element={<ProfilePage />} />
      <Route path={`${prefix}/profile/change-password`} element={<ChangePasswordPage />} />

      <Route element={<PermissionRoute permission="appointments.view" />}>
        <Route path={`${prefix}/schedule`} element={<ReceptionistSchedulePage />} />
        <Route path={`${prefix}/appointments`} element={<ReceptionistAppointmentsPage />} />
      </Route>

      <Route element={<PermissionRoute permission="appointments.create" />}>
        <Route path={`${prefix}/appointments/book`} element={<ReceptionistBookPage />} />
      </Route>

      <Route element={<PermissionRoute permission="patients.view" />}>
        <Route path={`${prefix}/patients`} element={<PatientListPage />} />
        <Route path={`${prefix}/patients/:id`} element={<DentistPatientDetailPage />} />
      </Route>

      <Route element={<PermissionRoute permission="billing.approve" />}>
        <Route path={`${prefix}/braces-approvals`} element={<BracesApprovalPage />} />
      </Route>

      <Route element={<PermissionRoute permission="reports.view" />}>
        <Route path={`${prefix}/reports`} element={<DentistReportsPage />} />
      </Route>
    </>
  );
}

function staffPageRoutes(prefix) {
  const DashboardPage = prefix === '/admin' ? AdminDashboardPage : StaffDashboardPage;

  return (
    <>
      <Route path={`${prefix}/dashboard`} element={<DashboardPage />} />
      <Route path={`${prefix}/profile`} element={<ProfilePage />} />
      <Route path={`${prefix}/profile/change-password`} element={<ChangePasswordPage />} />

      <Route element={<PermissionRoute permission="appointments.view" />}>
        <Route path={`${prefix}/schedule`} element={<ReceptionistSchedulePage />} />
        <Route path={`${prefix}/appointments`} element={<ReceptionistAppointmentsPage />} />
        <Route path={`${prefix}/waiting-list`} element={<ReceptionistWaitingListPage />} />
      </Route>

      <Route element={<PermissionRoute permission="appointments.create" />}>
        <Route path={`${prefix}/appointments/book`} element={<ReceptionistBookPage />} />
      </Route>

      <Route element={<PermissionRoute permission="billing.view" />}>
        <Route path={`${prefix}/billing`} element={<ReceptionistBillingPage />} />
      </Route>

      <Route element={<PermissionRoute permission="billing.approve" />}>
        <Route path={`${prefix}/braces-approvals`} element={<BracesApprovalPage />} />
      </Route>

      <Route element={<PermissionRoute permission="reports.view" />}>
        <Route path={`${prefix}/reports`} element={<AdminReportsPage />} />
      </Route>

      <Route element={<PermissionRoute permission="settings.view" />}>
        <Route path={`${prefix}/settings`} element={<SystemSettingsPage />} />
      </Route>

      <Route element={<PermissionRoute permission="audit.view" />}>
        <Route path={`${prefix}/audit-logs`} element={<AuditLogsPage />} />
      </Route>

      <Route element={<PermissionRoute permission="users.view" />}>
        <Route path={`${prefix}/users`} element={<UserListPage />} />
        <Route path={`${prefix}/users/:id`} element={<UserDetailPage />} />
      </Route>

      <Route element={<PermissionRoute permission="users.create" />}>
        <Route path={`${prefix}/users/create-staff`} element={<CreateStaffPage />} />
        <Route path={`${prefix}/users/create-receptionist`} element={<CreateReceptionistPage />} />
      </Route>

      <Route element={<PermissionRoute permission="roles.view" />}>
        <Route path={`${prefix}/roles`} element={<RoleListPage />} />
      </Route>

      <Route element={<PermissionRoute permission="permissions.manage" />}>
        <Route path={`${prefix}/roles/:id/permissions`} element={<RolePermissionsPage />} />
      </Route>

      <Route element={<PermissionRoute permission="permissions.view" />}>
        <Route path={`${prefix}/permissions`} element={<PermissionListPage />} />
      </Route>

      <Route element={<PermissionRoute permission="dentists.view" />}>
        <Route path={`${prefix}/dentists`} element={<AdminDentistDirectoryPage />} />
      </Route>

      <Route element={<PermissionRoute permission="patients.view" />}>
        <Route path={`${prefix}/patients`} element={<PatientListPage />} />
        <Route path={`${prefix}/patients/:id`} element={<AdminPatientDetailPage />} />
      </Route>
    </>
  );
}

export function AdminStaffRoutes() {
  return (
    <Route element={<RoleProtectedRoute roles={ROLES.ADMIN} />}>
      <Route element={<StaffLayout rolePrefix="/admin" />}>
        {staffPageRoutes('/admin')}
      </Route>
    </Route>
  );
}

export function DentistStaffRoutes() {
  return (
    <Route element={<RoleProtectedRoute roles={ROLES.DENTIST} />}>
      <Route element={<StaffLayout rolePrefix="/dentist" />}>
        {dentistPageRoutes('/dentist')}
      </Route>
    </Route>
  );
}

export function ReceptionistStaffRoutes() {
  return (
    <Route element={<RoleProtectedRoute roles={ROLES.RECEPTIONIST} />}>
      <Route element={<StaffLayout rolePrefix="/receptionist" />}>
        {staffPageRoutes('/receptionist')}
      </Route>
    </Route>
  );
}
