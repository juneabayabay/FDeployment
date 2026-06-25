import { FaPlusCircle } from 'react-icons/fa';

export default function DentistAuthDivider() {
  return (
    <div className="dentist-auth-divider" aria-hidden>
      <hr />
      <FaPlusCircle className="dentist-auth-divider-icon" />
      <hr />
    </div>
  );
}
