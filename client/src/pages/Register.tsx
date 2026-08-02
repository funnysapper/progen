import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button, Card, ErrorNote, Field, Input } from '../components/ui';
import { ApiError } from '../api/client';
import s from './auth.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/app');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.wrap}>
      <div className={s.panel}>
        <div className={s.brand}>
          <h1>ProGen</h1>
          <p>Write the perfect proposal in seconds</p>
        </div>
        <Card>
          <h2 className={s.title}>Create your account</h2>
          <form onSubmit={onSubmit}>
            {error && <ErrorNote>{error}</ErrorNote>}
            <div style={{ height: error ? 12 : 0 }} />
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field label="Password" hint="At least 8 characters">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </Field>
            <Button type="submit" block loading={loading}>
              Create account
            </Button>
          </form>
          <p className={s.foot}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
