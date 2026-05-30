import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [shelters, setShelters] = useState<any[]>([]);
  const [newShelter, setNewShelter] = useState({ name: '', address: '', parish: '', lat: '', lng: '', capacity: '', type: 'GENERAL', facilities: '' });
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState('');

  const PARISHES = ['Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine'];
  const TYPES = ['GENERAL','SCHOOL','CHURCH','COMMUNITY_CENTRE','SPORTS_COMPLEX','GOVERNMENT'];

  useEffect(() => {
    api.health().then(setStats).catch(() => {});
    api.getShelters().then(setShelters).catch(() => {});
  }, [success]);

  const addShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.addShelter({
        ...newShelter,
        lat: newShelter.lat ? parseFloat(newShelter.lat) : undefined,
        lng: newShelter.lng ? parseFloat(newShelter.lng) : undefined,
        capacity: parseInt(newShelter.capacity) || 0,
      }, token!);
      setSuccess('✅ Shelter added!');
      setNewShelter({ name: '', address: '', parish: '', lat: '', lng: '', capacity: '', type: 'GENERAL', facilities: '' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (e: any) { alert(e.message); }
    finally { setAdding(false); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1>🔧 Admin Dashboard</h1>
        <p style={{ color: '#8892a4', fontSize: 14 }}>System management and configuration</p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Active Alerts', value: stats.alerts, icon: '⚠️', color: '#e8a020' },
            { label: 'Open Shelters', value: stats.shelters, icon: '🏫', color: '#27ae60' },
            { label: 'Check-ins Today', value: stats.checkins_today, icon: '✅', color: '#2980b9' },
            { label: 'Uptime', value: `${Math.floor(stats.uptime / 3600)}h`, icon: '⏱️', color: '#8e44ad' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: '#8892a4', fontSize: 12 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        {/* Add Shelter Form */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>➕ Add Shelter</h3>
          {success && <div style={{ background: '#0d2e16', border: '1px solid #27ae60', borderRadius: 8, padding: '10px 14px', color: '#27ae60', marginBottom: 12, fontSize: 14 }}>{success}</div>}
          <form onSubmit={addShelter} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input placeholder="Shelter Name *" value={newShelter.name} onChange={e => setNewShelter(n => ({ ...n, name: e.target.value }))} required />
            <input placeholder="Address *" value={newShelter.address} onChange={e => setNewShelter(n => ({ ...n, address: e.target.value }))} required />
            <select value={newShelter.parish} onChange={e => setNewShelter(n => ({ ...n, parish: e.target.value }))} required>
              <option value="">Select Parish *</option>
              {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input placeholder="Latitude (e.g. 17.997)" value={newShelter.lat} onChange={e => setNewShelter(n => ({ ...n, lat: e.target.value }))} />
              <input placeholder="Longitude (e.g. -76.793)" value={newShelter.lng} onChange={e => setNewShelter(n => ({ ...n, lng: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input placeholder="Capacity" type="number" value={newShelter.capacity} onChange={e => setNewShelter(n => ({ ...n, capacity: e.target.value }))} />
              <select value={newShelter.type} onChange={e => setNewShelter(n => ({ ...n, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <input placeholder="Facilities (e.g. Generator, Medical)" value={newShelter.facilities} onChange={e => setNewShelter(n => ({ ...n, facilities: e.target.value }))} />
            <button type="submit" className="btn-primary" disabled={adding} style={{ padding: 12, marginTop: 4 }}>
              {adding ? 'Adding...' : '+ Add Shelter'}
            </button>
          </form>
        </div>

        {/* Shelters list */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>🏫 All Shelters ({shelters.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
            {shelters.map(s => (
              <div key={s.id} style={{ background: '#0f1e3d', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                  <span style={{ fontSize: 11, color: '#8892a4' }}>{s.type}</span>
                </div>
                <div style={{ color: '#8892a4', fontSize: 12 }}>{s.parish} · {s.address}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12 }}>
                  <span style={{ color: '#27ae60' }}>✅ {s.available} available</span>
                  <span style={{ color: '#8892a4' }}>👥 {s.capacity} capacity</span>
                  {s.lat && <span style={{ color: '#6a7a94' }}>📍 {s.lat.toFixed(3)}, {s.lng.toFixed(3)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seed credentials reminder */}
      <div className="card" style={{ marginTop: 20, background: '#1a1a00', borderColor: '#4a4a00' }}>
        <h4 style={{ color: '#e8a020', marginBottom: 8 }}>🔑 Default Credentials</h4>
        <div style={{ fontSize: 13, color: '#8892a4', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <span>👑 Admin: admin@preparejm.com / Admin2026!</span>
          <span>👮 Coordinator: coord@odpem.gov.jm / Coord2026!</span>
        </div>
        <div style={{ fontSize: 12, color: '#6a7a94', marginTop: 6 }}>⚠️ Change these immediately in production</div>
      </div>
    </div>
  );
}
