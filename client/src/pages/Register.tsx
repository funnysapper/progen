import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button, Input } from '../components/ui';
import { GoogleAuth } from '../components/GoogleAuth';
import { useToast } from '../components/toast';
import { ApiError } from '../api/client';
import s from './auth.module.css';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created — welcome to ProGen!');
      navigate('/');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.split}>
      <div className={`${s.imageSide} ${s.imgSignup}`} />
      <div className={s.formSide}>
        <div className={s.formInner}>
          <div className={s.brand}>
            Pro<span>Gen</span>
          </div>
          <h1 className={s.title}>Create your account</h1>

          <GoogleAuth
            label="Sign up with"
            run={loginWithGoogle}
            onDone={() => {
              toast.success('Signed up with Google');
              navigate('/');
            }}
            onError={toast.error}
          />

          <form onSubmit={onSubmit}>
            <div className={s.fields}>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
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
                minLength={8}
              />
            </div>
            <Button type="submit" block loading={loading}>
              Create account
            </Button>
          </form>

          <p className={s.foot}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
