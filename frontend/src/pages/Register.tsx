import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const PARISHES = ['Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine'];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', parish: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const { token, user } = await api.register(form);
      login(token, user);
      navigate('/dashboard');
    } catch (e: any) {
      setErr(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40 }}>🛡️</div>
          <h2 style={{ marginTop: 8 }}>Join PrepareJM</h2>
          <p style={{ color: '#8892a4', fontSize: 14 }}>Register for emergency alerts & shelter updates</p>
        </div>

        {err && <div style={{ background: '#3d1515', border: '1px solid #c0392b', borderRadius: 8, padding: '10px 14px', color: '#e74c3c', marginBottom: 16, fontSize: 14 }}>{err}</div>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: '#8892a4', marginBottom: 6, display: 'block' }}>Full Name *</label>
            <input placeholder="John Brown" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#8892a4', marginBottom: 6, display: 'block' }}>Email *</label>
            <input type="email" placeholder="john@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#8892a4', marginBottom: 6, display: 'block' }}>Password *</label>
            <input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={set('password')} minLength={8} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: '#8892a4', marginBottom: 6, display: 'block' }}>Phone (for SMS)</label>
              <input placeholder="+1876..." value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#8892a4', marginBottom: 6, display: 'block' }}>Parish</label>
              <select value={form.parish} onChange={set('parish')}>
                <option value="">Select...</option>
                {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8, padding: '12px' }}>
            {loading ? 'Creating account...' : 'Create Account — It\'s Free'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6a7a94' }}>
          By registering you agree to receive emergency SMS alerts for your parish.
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 14, color: '#8892a4' }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
