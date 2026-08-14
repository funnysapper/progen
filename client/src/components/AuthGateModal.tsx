import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './toast';
import { Button, Input } from './ui';
import { GoogleAuth } from './GoogleAuth';
import { ApiError } from '../api/client';
import s from './authgate.module.css';

// A sign-in / sign-up modal shown when a guest tries to download or save.
// Because it's a modal (not a route change), the generator keeps all its state,
// so the exact proposal the guest is viewing survives the sign-up.
export function AuthGateModal({
  title,
  subtitle,
  onSuccess,
  onClose,
}: {
  title: string;
  subtitle: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const { login, register, loginWithGoogle } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') await register(name, email, password);
      else await login(email, password);
      toast.success(mode === 'signup' ? 'Account created!' : 'Signed in!');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <button className={s.close} onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 className={s.title}>{title}</h2>
        <p className={s.subtitle}>{subtitle}</p>

        <div className={s.tabs}>
          <button
            type="button"
            className={mode === 'signup' ? s.tabActive : s.tab}
            onClick={() => setMode('signup')}
          >
            Create account
          </button>
          <button
            type="button"
            className={mode === 'signin' ? s.tabActive : s.tab}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
        </div>

        <GoogleAuth
          label={mode === 'signup' ? 'Sign up with' : 'Sign in with'}
          run={loginWithGoogle}
          onDone={() => {
            toast.success('Signed in with Google');
            onSuccess();
          }}
          onError={toast.error}
        />

        <form onSubmit={submit}>
          <div className={s.fields}>
            {mode === 'signup' && (
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
            )}
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={mode === 'signup' ? 8 : undefined}
            />
          </div>
          <Button type="submit" block loading={loading}>
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
