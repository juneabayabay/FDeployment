import { Navigate, Route, Routes } from 'react-router-dom';
import PatientLayout from './layouts/PatientLayout';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import DentistLoginPage from './pages/auth/DentistLoginPage';
import PatientLoginPage from './pages/auth/PatientLoginPage';
import PortalHomePage from './pages/auth/PortalHomePage';
import ReceptionistLoginPage from './pages/auth/ReceptionistLoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import UnauthorizedPage from './pages/errors/UnauthorizedPage';
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import AppointmentCalendarPage from './pages/patient/AppointmentCalendarPage';
import PatientAppointmentsPage from './pages/patient/PatientAppointmentsPage';
import PatientBillingPage from './pages/patient/PatientBillingPage';
import WaitingListPage from './pages/patient/WaitingListPage';
import PatientNotificationsPage from './pages/patient/PatientNotificationsPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';
import PatientDentistsPage from './pages/patient/PatientDentistsPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleProtectedRoute from './routes/RoleProtectedRoute';
import LegacyStaffRedirect from './routes/LegacyStaffRedirect';
import PatientTypoRedirect from './routes/PatientTypoRedirect';
import {
  AdminStaffRoutes,
  DentistStaffRoutes,
  ReceptionistStaffRoutes,
} from './routes/staffRoutes';
import { ROLES } from './utils/constants';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PatientLoginPage />} />
      <Route path="/login" element={<PatientLoginPage />} />

      <Route path="/demo" element={<PortalHomePage />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/dentist" element={<DentistLoginPage />} />
      <Route path="/receptionist" element={<ReceptionistLoginPage />} />

      {/* Legacy login URLs */}
      <Route path="/login/patient" element={<Navigate to="/" replace />} />
      <Route path="/login/admin" element={<Navigate to="/admin" replace />} />
      <Route path="/login/dentist" element={<Navigate to="/dentist" replace />} />
      <Route path="/login/receptionist" element={<Navigate to="/receptionist" replace />} />

      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Common typo: /patien/* → /patient/* */}
      <Route path="/patien" element={<PatientTypoRedirect />} />
      <Route path="/patien/*" element={<PatientTypoRedirect />} />
      <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleProtectedRoute roles={ROLES.USER} />}>
          <Route element={<PatientLayout />}>
            <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
            <Route path="/patient/book" element={<BookAppointmentPage />} />
            <Route path="/patient/dentists" element={<PatientDentistsPage />} />
            <Route path="/patient/calendar" element={<AppointmentCalendarPage />} />
            <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
            <Route path="/patient/billing" element={<PatientBillingPage />} />
            <Route path="/patient/waiting-list" element={<WaitingListPage />} />
            <Route path="/patient/notifications" element={<PatientNotificationsPage />} />
            <Route path="/patient/profile" element={<PatientProfilePage />} />
          </Route>
        </Route>

        {AdminStaffRoutes()}
        {DentistStaffRoutes()}
        {ReceptionistStaffRoutes()}

        {/* Legacy staff paths → role-prefixed routes */}
        <Route path="/dashboard" element={<LegacyStaffRedirect />} />
        <Route path="/profile/*" element={<LegacyStaffRedirect />} />
        <Route path="/users/*" element={<LegacyStaffRedirect />} />
        <Route path="/roles/*" element={<LegacyStaffRedirect />} />
        <Route path="/permissions/*" element={<LegacyStaffRedirect />} />
        <Route path="/patients/*" element={<LegacyStaffRedirect />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
