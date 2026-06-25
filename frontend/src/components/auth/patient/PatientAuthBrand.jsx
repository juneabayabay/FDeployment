import { FaTooth } from 'react-icons/fa';
import { APP_NAME } from '../../../utils/constants';

export default function PatientAuthBrand() {
  return (
    <div className="patient-auth-brand">
      <div className="patient-auth-brand-icon" aria-hidden>
        <FaTooth />
      </div>
      <p className="patient-auth-brand-name">{APP_NAME}</p>
      <p className="patient-auth-brand-tag">Patient Portal</p>
    </div>
  );
}
