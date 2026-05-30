import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const TYPES = ['GENERAL','HURRICANE','FLOOD','EARTHQUAKE','FIRE','TSUNAMI','STORM_SURGE','LANDSLIDE'];
const SEVERITIES = ['INFO','WARNING','WATCH','EMERGENCY'];
const PARISHES_ALL = 'ALL';
const PARISHES = ['Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine'];

export default function CoordDashboard() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [tab, setTab] = useState<'alerts'|'checkins'|'shelters'>('alerts');
  const [newAlert, setNewAlert] = useState({ title: '', message: '', type: 'HURRICANE', severity: 'WARNING', parishes: 'ALL', expires_at: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const [a, c, s] = await Promise.all([
        api.getAllAlerts(token!),
        api.allCheckins(token!),
        api.getShelters(),
      ]);
      setAlerts(a); setCheckins(c); setShelters(s);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { refresh(); const t = setInterval(refresh, 30000); return () => clearInterval(t); }, []);

  const issueAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createAlert({ ...newAlert, expires_at: newAlert.expires_at || undefined }, token!);
      setSuccess('✅ Alert issued and SMS broadcast sent!');
      setNewAlert({ title: '', message: '', type: 'HURRICANE', severity: 'WARNING', parishes: 'ALL', expires_at: '' });
      await refresh();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally { setSubmitting(false); }
  };

  const deactivate = async (id: string) => {
    await api.deleteAlert(id, token!);
    await refresh();
  };

  const updateOccupancy = async (id: string, val: string) => {
    const n = parseInt(val);
    if (isNaN(n)) return;
    await api.updateOccupancy(id, n, token!);
    await refresh();
  };

  const needHelp = checkins.filter(c => c.status === 'NEED_HELP');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>📡 Command Center</h1>
          <p style={{ color: '#8892a4', fontSize: 14 }}>Issue alerts, monitor check-ins, manage shelters</p>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
          <div className="card" style={{ padding: '8px 16px', borderColor: needHelp.length > 0 ? '#c0392b' : '#2a3d6b' }}>
            🆘 <strong style={{ color: needHelp.length > 0 ? '#e74c3c' : '#8892a4' }}>{needHelp.length}</strong> need help
          </div>
          <div className="card" style={{ padding: '8px 16px' }}>
            ✅ <strong>{checkins.filter(c => c.status === 'SAFE').length}</strong> safe today
          </div>
        </div>
      </div>

      {/* HELP ALERT */}
      {needHelp.length > 0 && (
        <div style={{ background: '#3d0000', border: '1px solid #c0392b', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <strong>🆘 CITIZENS NEEDING HELP ({needHelp.length})</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {needHelp.slice(0, 5).map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                <span style={{ color: '#e74c3c', fontWeight: 700 }}>{c.user_name}</span>
                <span style={{ color: '#8892a4' }}>{c.user_phone}</span>
                <span style={{ color: '#8892a4' }}>{c.user_parish}</span>
                {c.message && <span style={{ color: '#8892a4' }}>"{c.message}"</span>}
                <span style={{ color: '#6a7a94', marginLeft: 'auto' }}>{new Date(c.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {(['alerts','checkins','shelters'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn-primary' : 'btn-ghost'} style={{ padding: '8px 20px', textTransform: 'capitalize' }}>
            {t === 'alerts' ? '⚠️ Alerts' : t === 'checkins' ? '✅ Check-ins' : '🏫 Shelters'}
          </button>
        ))}
      </div>

      {/* ALERTS TAB */}
      {tab === 'alerts' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
          {/* Issue form */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Issue New Alert</h3>
            {success && <div style={{ background: '#0d2e16', border: '1px solid #27ae60', borderRadius: 8, padding: '10px 14px', color: '#27ae60', marginBottom: 12, fontSize: 14 }}>{success}</div>}
            <form onSubmit={issueAlert} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#8892a4', marginBottom: 4, display: 'block' }}>Title *</label>
                <input placeholder="e.g., Hurricane Warning — St. James" value={newAlert.title} onChange={e => setNewAlert(n => ({ ...n, title: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#8892a4', marginBottom: 4, display: 'block' }}>Message *</label>
                <textarea rows={3} placeholder="Detailed alert message..." value={newAlert.message} onChange={e => setNewAlert(n => ({ ...n, message: e.target.value }))} required style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#8892a4', marginBottom: 4, display: 'block' }}>Type</label>
                  <select value={newAlert.type} onChange={e => setNewAlert(n => ({ ...n, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#8892a4', marginBottom: 4, display: 'block' }}>Severity</label>
                  <select value={newAlert.severity} onChange={e => setNewAlert(n => ({ ...n, severity: e.target.value }))}>
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#8892a4', marginBottom: 4, display: 'block' }}>Parishes (hold Ctrl for multi)</label>
                <select value={newAlert.parishes} onChange={e => setNewAlert(n => ({ ...n, parishes: e.target.value }))}>
                  <option value="ALL">ALL PARISHES</option>
                  {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#8892a4', marginBottom: 4, display: 'block' }}>Expires At (optional)</label>
                <input type="datetime-local" value={newAlert.expires_at} onChange={e => setNewAlert(n => ({ ...n, expires_at: e.target.value }))} />
              </div>
              <button type="submit" className="btn-danger" disabled={submitting} style={{ padding: 12 }}>
                {submitting ? 'Sending...' : '🚨 Issue Alert + Broadcast SMS'}
              </button>
            </form>
          </div>

          {/* Active alerts list */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Active Alerts ({alerts.filter(a => a.active).length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 500, overflowY: 'auto' }}>
              {alerts.map(a => (
                <div key={a.id} style={{ background: '#0f1e3d', borderRadius: 8, padding: 12, borderLeft: `3px solid ${a.active ? severityColor(a.severity) : '#2a3d6b'}`, opacity: a.active ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
                    <span className={`badge badge-${a.severity.toLowerCase()}`}>{a.severity}</span>
                  </div>
                  <div style={{ color: '#8892a4', fontSize: 12 }}>{a.message.slice(0, 100)}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#6a7a94' }}>
                    <span>{a.parishes} · SMS: {a.sms_sent || 0}</span>
                    {a.active && <button onClick={() => deactivate(a.id)} className="btn-danger" style={{ padding: '2px 8px', fontSize: 11 }}>Deactivate</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHECKINS TAB */}
      {tab === 'checkins' && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>All Check-Ins ({checkins.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#0f1e3d', textAlign: 'left' }}>
                  {['Name','Phone','Parish','Status','Message','Time'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', color: '#8892a4', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {checkins.map((c, i) => (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? '#1a2d54' : 'transparent', borderBottom: '1px solid #1a3060' }}>
                    <td style={{ padding: '8px 14px', fontWeight: 600 }}>{c.user_name}</td>
                    <td style={{ padding: '8px 14px', color: '#8892a4' }}>{c.user_phone || '—'}</td>
                    <td style={{ padding: '8px 14px', color: '#8892a4' }}>{c.user_parish || '—'}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span className={`badge badge-${c.status === 'SAFE' ? 'safe' : c.status === 'NEED_HELP' ? 'help' : c.status === 'EVACUATING' ? 'evac' : 'shelter'}`}>
                        {c.status.replace('_',' ')}
                      </span>
                    </td>
                    <td style={{ padding: '8px 14px', color: '#8892a4' }}>{c.message || '—'}</td>
                    <td style={{ padding: '8px 14px', color: '#6a7a94', whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SHELTERS TAB */}
      {tab === 'shelters' && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Shelter Occupancy Management</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {shelters.map(s => (
              <div key={s.id} style={{ background: '#0f1e3d', borderRadius: 8, padding: 14, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                  <div style={{ color: '#8892a4', fontSize: 12 }}>{s.parish} · {s.type}</div>
                </div>
                <div style={{ width: 200 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ flex: 1, background: '#1a3060', borderRadius: 4, height: 8 }}>
                      <div style={{ width: `${100 - s.availability_pct}%`, background: s.availability_pct > 50 ? '#27ae60' : '#e67e22', height: '100%', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#8892a4' }}>{s.occupancy}/{s.capacity}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="number"
                    min="0"
                    max={s.capacity}
                    defaultValue={s.occupancy}
                    style={{ width: 70 }}
                    onBlur={e => updateOccupancy(s.id, e.target.value)}
                  />
                  <span style={{ fontSize: 12, color: '#8892a4' }}>occupancy</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function severityColor(s: string) {
  return s === 'EMERGENCY' ? '#c0392b' : s === 'WATCH' ? '#e67e22' : s === 'WARNING' ? '#f39c12' : '#2980b9';
}
