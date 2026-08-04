import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import s from './avatar.module.css';

function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}

export function AvatarMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking anywhere outside it.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className={s.wrap} ref={ref}>
      <button className={s.avatar} onClick={() => setOpen((o) => !o)} aria-label="Account menu">
        {initials(user?.name)}
      </button>
      {open && (
        <div className={s.menu}>
          <div className={s.info}>
            <div className={s.name}>{user?.name ?? 'Signed in'}</div>
            <div className={s.email}>{user?.email}</div>
          </div>
          <button className={s.logout} onClick={() => logout()}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
