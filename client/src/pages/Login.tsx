import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button, Input } from '../components/ui';
import { GoogleAuth } from '../components/GoogleAuth';
import { useToast } from '../components/toast';
import { ApiError } from '../api/client';
import s from './auth.module.css';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.split}>
      <div className={`${s.imageSide} ${s.imgSignin}`} />
      <div className={s.formSide}>
        <div className={s.formInner}>
          <div className={s.brand}>
            Pro<span>Gen</span>
          </div>
          <h1 className={s.title}>Welcome Back!</h1>

          <GoogleAuth
            label="Sign in with"
            run={loginWithGoogle}
            onDone={() => {
              toast.success('Signed in with Google');
              navigate('/');
            }}
            onError={toast.error}
          />

          <form onSubmit={onSubmit}>
            <div className={s.fields}>
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
              />
            </div>
            <Button type="submit" block loading={loading}>
              Sign in
            </Button>
          </form>

          <p className={s.foot}>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
