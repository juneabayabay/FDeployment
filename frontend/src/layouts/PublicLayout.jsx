import { Outlet } from 'react-router-dom';
import PublicBackground from '../components/public/PublicBackground';
import PublicFooter from '../components/public/PublicFooter';
import PublicHeader from '../components/public/PublicHeader';

export default function PublicLayout() {
  return (
    <div className="public-site">
      <PublicBackground />
      <PublicHeader />
      <Outlet />
      <PublicFooter />
    </div>
  );
}
