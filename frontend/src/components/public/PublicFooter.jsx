import { Link } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="copyright">
        &copy; {new Date().getFullYear()} {APP_NAME}
      </div>
      <div className="public-footer-links">
        <Link to="/about">About</Link>
        <Link to="/login" className="accent-link">
          Patient login
        </Link>
        <Link to="/register" className="accent-link">
          Register
        </Link>
      </div>
    </footer>
  );
}
