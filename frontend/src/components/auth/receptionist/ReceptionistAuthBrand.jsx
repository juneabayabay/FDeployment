import { FaHeadset, FaLock } from 'react-icons/fa';

export default function ReceptionistAuthBrand() {
  return (
    <div className="receptionist-auth-header">
      <div className="receptionist-auth-icon" aria-hidden>
        <FaHeadset />
      </div>
      <div className="receptionist-auth-brand-text">
        Barnabas <span>Dental</span>
      </div>
      <div className="receptionist-auth-badge">
        <FaLock aria-hidden />
        Receptionist
      </div>
    </div>
  );
}
