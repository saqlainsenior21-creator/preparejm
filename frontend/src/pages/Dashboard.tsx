import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Dashboard() {
  const { user, token, isCoord, isAdmin } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = user?.parish;
    Promise.all([
      api.getAlerts(p || undefined),
      api.myCheckins(token!),
      api.getShelters(p || undefined),
    ]).then(([a, c, s]) => {
      setAlerts(a); setCheckins(c); setShelters(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#8892a4' }}>Loading your dashboard...</div>;

  const lastCheckin = checkins[0];
  const activeShelters = shelters.filter((s: any) => s.available > 0);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: '#8892a4', fontSize: 14 }}>
          {user?.parish ? `${user.parish} Parish` : 'All Parishes'} · {new Date().toLocaleDateString('en-JM', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
        <Link to="/checkin" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ textAlign: 'center', padding: 24, cursor: 'pointer', borderColor: '#27ae60', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: 36 }}>✅</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>Check In Safe</div>
            <div style={{ color: '#8892a4', fontSize: 12, marginTop: 4 }}>Let family know you're OK</div>
          </div>
        </Link>
        <Link to="/shelters" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ textAlign: 'center', padding: 24, cursor: 'pointer', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: 36 }}>🏫</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>Find Shelter</div>
            <div style={{ color: '#8892a4', fontSize: 12, marginTop: 4 }}>{activeShelters.length} shelters available</div>
          </div>
        </Link>
        <Link to="/evacuate" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ textAlign: 'center', padding: 24, cursor: 'pointer', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: 36 }}>🚗</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>Evacuation Routes</div>
            <div style={{ color: '#8892a4', fontSize: 12, marginTop: 4 }}>Pre-planned safe routes</div>
          </div>
        </Link>
        {(isCoord || isAdmin) && (
          <Link to="/coord" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', padding: 24, cursor: 'pointer', borderColor: '#e8a020', transition: 'transform 0.2s' }}>
              <div style={{ fontSize: 36 }}>📡</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>Command Center</div>
              <div style={{ color: '#8892a4', fontSize: 12, marginTop: 4 }}>Issue alerts, manage shelters</div>
            </div>
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Active Alerts */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>⚠️ Active Alerts</h3>
          {alerts.length === 0 ? (
            <div style={{ color: '#8892a4', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              ✅ No active alerts for your area
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.slice(0, 4).map(a => (
                <div key={a.id} style={{ borderLeft: `3px solid ${severityColor(a.severity)}`, paddingLeft: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
                  <div style={{ color: '#8892a4', fontSize: 12 }}>{a.message.slice(0, 80)}{a.message.length > 80 ? '...' : ''}</div>
                  <span className={`badge badge-${a.severity.toLowerCase()}`} style={{ marginTop: 4 }}>{a.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Status */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📋 My Status</h3>
          {lastCheckin ? (
            <div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>{statusIcon(lastCheckin.status)}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{lastCheckin.status.replace('_', ' ')}</div>
                  <div style={{ color: '#8892a4', fontSize: 12 }}>{new Date(lastCheckin.created_at).toLocaleString()}</div>
                </div>
              </div>
              {lastCheckin.message && <p style={{ color: '#8892a4', fontSize: 13 }}>{lastCheckin.message}</p>}
            </div>
          ) : (
            <div style={{ color: '#8892a4', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              No check-ins yet<br />
              <Link to="/checkin">Check in now →</Link>
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ fontSize: 13, color: '#8892a4', marginBottom: 8 }}>Recent check-ins</h4>
            {checkins.slice(0, 3).map((c: any) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid #1a3060' }}>
                <span>{statusIcon(c.status)} {c.status.replace('_', ' ')}</span>
                <span style={{ color: '#6a7a94' }}>{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nearby shelters */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 16 }}>🏫 Nearby Shelters {user?.parish ? `— ${user.parish}` : ''}</h3>
        {shelters.length === 0 ? (
          <p style={{ color: '#8892a4', fontSize: 14 }}>No shelters found</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {shelters.slice(0, 6).map((s: any) => (
              <div key={s.id} style={{ background: '#0f1e3d', borderRadius: 8, padding: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                <div style={{ color: '#8892a4', fontSize: 12 }}>{s.address}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#1a3060', borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${s.availability_pct}%`, background: s.availability_pct > 50 ? '#27ae60' : s.availability_pct > 20 ? '#e67e22' : '#c0392b', height: '100%', borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#8892a4', whiteSpace: 'nowrap' }}>{s.available}/{s.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link to="/shelters" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 14 }}>View all shelters →</Link>
      </div>
    </div>
  );
}

function severityColor(s: string) {
  return s === 'EMERGENCY' ? '#c0392b' : s === 'WATCH' ? '#e67e22' : s === 'WARNING' ? '#f39c12' : '#2980b9';
}

function statusIcon(s: string) {
  return s === 'SAFE' ? '✅' : s === 'NEED_HELP' ? '🆘' : s === 'EVACUATING' ? '🚗' : '🏠';
}
