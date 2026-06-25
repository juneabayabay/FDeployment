import GeoParticles from './GeoParticles';
export default function AdminAuthShell({ children }) {
  return (
    <div className="admin-auth-page">
      <div className="admin-auth-orb admin-auth-orb-1" aria-hidden />
      <div className="admin-auth-orb admin-auth-orb-2" aria-hidden />
      <div className="admin-auth-orb admin-auth-orb-3" aria-hidden />
      <div className="admin-auth-orb admin-auth-orb-4" aria-hidden />
      <div className="admin-auth-orb admin-auth-orb-5" aria-hidden />
      <GeoParticles />
      <div className="admin-auth-card">{children}</div>
    </div>
  );
}
