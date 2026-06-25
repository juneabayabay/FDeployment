import AuthParticles from '../patient/AuthParticles';

export default function ReceptionistAuthShell({ children }) {
  return (
    <div className="receptionist-auth-page">
      <div className="receptionist-auth-orb receptionist-auth-orb-1" aria-hidden />
      <div className="receptionist-auth-orb receptionist-auth-orb-2" aria-hidden />
      <div className="receptionist-auth-orb receptionist-auth-orb-3" aria-hidden />
      <div className="receptionist-auth-orb receptionist-auth-orb-4" aria-hidden />
      <div className="receptionist-auth-orb receptionist-auth-orb-5" aria-hidden />
      <AuthParticles
        particleClass="receptionist-auth-particle"
        containerClass="receptionist-auth-particles"
      />
      <div className="receptionist-auth-card">{children}</div>
    </div>
  );
}
