import { FaLock, FaUserShield } from 'react-icons/fa';

export default function AdminAuthBrand() {
  return (
    <div className="admin-auth-header">
      <div className="admin-auth-shield" aria-hidden>
        <FaUserShield />
      </div>
      <div className="admin-auth-brand-text">
        Barnabas <span>Dental</span>
      </div>
      <div className="admin-auth-badge">
        <FaLock aria-hidden />
        Admin
      </div>
    </div>
  );
}
