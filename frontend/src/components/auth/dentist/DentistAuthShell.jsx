import DiamondParticles from './DiamondParticles';

export default function DentistAuthShell({ children }) {
  return (
    <div className="dentist-auth-page">
      <div className="dentist-auth-orb dentist-auth-orb-1" aria-hidden />
      <div className="dentist-auth-orb dentist-auth-orb-2" aria-hidden />
      <div className="dentist-auth-orb dentist-auth-orb-3" aria-hidden />
      <div className="dentist-auth-orb dentist-auth-orb-4" aria-hidden />
      <div className="dentist-auth-orb dentist-auth-orb-5" aria-hidden />
      <div className="dentist-auth-orb dentist-auth-orb-6" aria-hidden />
      <DiamondParticles />
      <div className="dentist-auth-card">{children}</div>
    </div>
  );
}
