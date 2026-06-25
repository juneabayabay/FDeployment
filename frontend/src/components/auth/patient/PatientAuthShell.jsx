import AuthParticles from './AuthParticles';
import PatientAuthBrand from './PatientAuthBrand';

export default function PatientAuthShell({ children }) {
  return (
    <div className="patient-auth-page">
      <div className="patient-auth-bubble patient-auth-bubble-1" aria-hidden />
      <div className="patient-auth-bubble patient-auth-bubble-2" aria-hidden />
      <div className="patient-auth-bubble patient-auth-bubble-3" aria-hidden />
      <div className="patient-auth-bubble patient-auth-bubble-4" aria-hidden />
      <div className="patient-auth-bubble patient-auth-bubble-5" aria-hidden />
      <AuthParticles />
      <div className="patient-auth-card">
        <PatientAuthBrand />
        {children}
      </div>
    </div>
  );
}
