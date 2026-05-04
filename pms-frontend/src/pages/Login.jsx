import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(form.email, form.password);
    if (!result.ok) {
      setError(result.error || 'Login failed');
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#121c27', color: '#fff', display: 'grid', placeItems: 'center' }}>
      <form
        onSubmit={handleSubmit}
        style={{ width: 360, maxWidth: '90vw', padding: 20, borderRadius: 12, background: '#1b2735', border: '1px solid #2f4156' }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 16, fontSize: '1.4rem' }}>Login</h1>

        {error && (
          <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,59,48,0.2)', border: '1px solid rgba(255,107,107,0.4)' }}>
            {error}
          </div>
        )}

        <label style={{ display: 'block', marginBottom: 6, color: '#9fb3c8' }}>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="admin@gmail.com"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: 12,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #2f4156',
            background: '#121c27',
            color: '#fff'
          }}
        />

        <label style={{ display: 'block', marginBottom: 6, color: '#9fb3c8' }}>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="admin"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: 16,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #2f4156',
            background: '#121c27',
            color: '#fff'
          }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 999,
            border: '1px solid #5a6f86',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Sign in
        </button>

        <div style={{ marginTop: 12, color: '#9fb3c8', fontSize: 13 }}>
          Demo: <strong>admin@gmail.com</strong> / <strong>admin</strong>
        </div>
      </form>
    </div>
  );
}