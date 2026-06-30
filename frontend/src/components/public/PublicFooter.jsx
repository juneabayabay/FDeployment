import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaTooth,
  FaYoutube,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

export default function PublicFooter() {
  const { isAuthenticated } = useAuth();
  const bookPath = isAuthenticated ? '/patient/book' : '/login';

  return (
    <footer className="public-site-footer">
      <div className="public-container">
        <div className="public-footer-grid">
          <div className="public-footer-brand">
            <div className="public-logo-icon">
              <FaTooth aria-hidden />
            </div>
            <h2>Barnabas Dental</h2>
            <p>
              Providing exceptional dental care with a personal touch. Your smile is our priority.
            </p>
            <div className="public-footer-social">
              <a href="#" aria-label="Facebook">
                <FaFacebookF aria-hidden />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram aria-hidden />
              </a>
              <a href="#" aria-label="YouTube">
                <FaYoutube aria-hidden />
              </a>
              <a href="#" aria-label="TikTok">
                <FaTiktok aria-hidden />
              </a>
            </div>
          </div>

          <div className="public-footer-links">
            <h4>Quick Links</h4>
            <Link to="/about">About Us</Link>
            <Link to="/about#services">Services</Link>
            <Link to={bookPath}>Book Appointment</Link>
            <Link to="/login">Patient Portal</Link>
          </div>

          <div className="public-footer-links">
            <h4>Support</h4>
            <Link to="/about">Contact Us</Link>
            <Link to="/about">Privacy Policy</Link>
            <Link to="/about">Terms of Service</Link>
            <Link to="/about">FAQ</Link>
          </div>
        </div>

        <div className="public-footer-bottom">
          <span>&copy; {new Date().getFullYear()} Barnabas Dental Clinic. All rights reserved.</span>
          <div className="public-footer-links-inline">
            <Link to="/about">About</Link>
            <Link to="/login">Patient login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
