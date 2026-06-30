import { FaTooth } from 'react-icons/fa';

export default function PublicBackground() {
  return (
    <div className="public-bg-animation" aria-hidden>
      <div className="public-bg-shape" />
      <div className="public-bg-shape" />
      <div className="public-bg-shape" />
      <div className="public-bg-shape" />
      <div className="public-float-icon">
        <FaTooth />
      </div>
      <div className="public-float-icon">
        <FaTooth />
      </div>
    </div>
  );
}
