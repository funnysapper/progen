import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AvatarMenu } from './AvatarMenu';
import s from './topnav.module.css';

// Shared top navigation used across the app. Pass onToggleSidebar to show the
// history toggle button (used on the generator page).
export function TopNav({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const goApp = () => navigate('/app');
  const goTemplates = () => navigate('/templates');

  return (
    <nav className={s.nav}>
      <div className={s.left}>
        {onToggleSidebar && (
          <button className={s.toggle} onClick={onToggleSidebar} aria-label="Toggle history">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <span className={s.logo} onClick={() => navigate('/')}>
          Pro<span className={s.dim}>Gen</span>
        </span>
      </div>

      <div className={s.right}>
        <button className={s.link} onClick={goApp}>
          Generator
        </button>
        <button className={s.link} onClick={goTemplates}>
          Templates
        </button>
        {isAuthenticated ? (
          <AvatarMenu />
        ) : (
          <button className={s.signBtn} onClick={() => navigate('/login')}>
            Sign in / Sign up
          </button>
        )}
      </div>
    </nav>
  );
}
