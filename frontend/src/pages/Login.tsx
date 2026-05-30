import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const { token, user } = await api.login(form);
      login(token, user);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'coordinator' ? '/coord' : '/dashboard');
    } catch (e: any) {
      setErr(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40 }}>🛡️</div>
          <h2 style={{ marginTop: 8 }}>Login to PrepareJM</h2>
          <p style={{ color: '#8892a4', fontSize: 14, marginTop: 4 }}>Your safety, our priority</p>
        </div>

        {err && <div style={{ background: '#3d1515', border: '1px solid #c0392b', borderRadius: 8, padding: '10px 14px', color: '#e74c3c', marginBottom: 16, fontSize: 14 }}>{err}</div>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: '#8892a4', marginBottom: 6, display: 'block' }}>Email Address</label>
            <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#8892a4', marginBottom: 6, display: 'block' }}>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8, padding: '12px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#8892a4' }}>
          New to PrepareJM? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}
