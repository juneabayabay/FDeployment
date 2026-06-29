import { Outlet } from 'react-router-dom';
import PublicBubbles from '../components/public/PublicBubbles';
import PublicFooter from '../components/public/PublicFooter';
import PublicHeader from '../components/public/PublicHeader';
import PublicMainCard from '../components/public/PublicMainCard';

export default function PublicLayout() {
  return (
    <div className="public-page">
      <PublicBubbles />
      <PublicMainCard>
        <PublicHeader />
        <Outlet />
        <PublicFooter />
      </PublicMainCard>
    </div>
  );
}
