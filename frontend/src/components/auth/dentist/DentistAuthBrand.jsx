import { FaLock, FaTooth } from 'react-icons/fa';

export default function DentistAuthBrand() {
  return (
    <div className="dentist-auth-header">
      <div className="dentist-auth-tooth" aria-hidden>
        <FaTooth />
      </div>
      <div className="dentist-auth-brand-text">
        Barnabas <span>Dental</span>
      </div>
      <div className="dentist-auth-badge">
        <FaLock aria-hidden />
        Dentist
      </div>
    </div>
  );
}
