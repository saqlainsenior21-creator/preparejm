import React, { useEffect, useState } from 'react';
import { api } from '../api';

const PARISHES = ['','Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine'];

const TIPS = [
  { icon: '🎒', title: 'Emergency Kit', items: ['Water (1 gallon/person/day for 3 days)','Non-perishable food (3-day supply)','Flashlight + batteries','First aid kit','Medications','Important documents (copies)','Cash in small bills','Phone charger + power bank'] },
  { icon: '📋', title: 'Before You Leave', items: ['Listen to official radio/TV alerts','Follow only official evacuation orders','Tell someone your destination','Fill gas tank before roads get busy','Lock your home','Turn off gas/electricity if time permits','Take pets if possible'] },
  { icon: '🚗', title: 'On the Road', items: ['Follow designated evacuation routes only','Avoid flooded roads — turn around, don\'t drown','Stay tuned to Radio Jamaica 94 FM','Don\'t stop on bridges','Keep gas above half tank','Maintain safe following distance'] },
  { icon: '🏠', title: 'At the Shelter', items: ['Register with shelter staff immediately','Keep your ID accessible','Follow all staff instructions','Stay informed via shelter announcements','Keep your family together','Report any medical needs immediately'] },
];

const RADIO = [
  { name: 'Radio Jamaica', freq: '94 FM', note: 'Primary emergency broadcasts' },
  { name: 'RJR News FM', freq: '93.7 FM', note: 'Rolling news updates' },
  { name: 'PBCJ Radio', freq: '101 FM', note: 'Government broadcasts' },
  { name: 'Irie FM', freq: '107.5 FM', note: 'Parish-specific updates' },
];

export default function Evacuate() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [parish, setParish] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getEvacRoutes(parish || undefined).then(setRoutes).catch(() => {}).finally(() => setLoading(false));
  }, [parish]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1>🚗 Evacuation Guide</h1>
        <p style={{ color: '#8892a4', fontSize: 14 }}>Official routes and emergency procedures for all parishes</p>
      </div>

      {/* Emergency Banner */}
      <div className="card" style={{ background: '#1a0808', borderColor: '#c0392b', marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🚨 During an Emergency</div>
        <div style={{ color: '#8892a4', fontSize: 14 }}>
          Tune to <strong style={{ color: '#e8a020' }}>Radio Jamaica 94 FM</strong> for official instructions.
          Only evacuate when ordered by official authorities. Call <strong style={{ color: '#e8a020' }}>110 (Police)</strong> or
          <strong style={{ color: '#e8a020' }}> 119 (Ambulance)</strong> for immediate help.
          ODPEM Hotline: <strong style={{ color: '#e8a020' }}>1-888-ODPEM-07</strong>
        </div>
      </div>

      {/* Routes */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>📍 Evacuation Routes</h3>
          <select value={parish} onChange={e => setParish(e.target.value)} style={{ width: 180 }}>
            {PARISHES.map(p => <option key={p} value={p}>{p || 'All Parishes'}</option>)}
          </select>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 30, color: '#8892a4' }}>Loading routes...</div>}
        {!loading && routes.length === 0 && (
          <div style={{ textAlign: 'center', padding: 30, color: '#8892a4' }}>
            No routes on record for this parish. Follow official radio instructions.
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {routes.map(r => (
            <div key={r.id} style={{ background: '#0f1e3d', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontWeight: 700 }}>{r.name}</div>
                <span style={{ background: '#1a3a6b', padding: '2px 10px', borderRadius: 20, fontSize: 11 }}>{r.parish}</span>
              </div>
              {r.description && <p style={{ color: '#8892a4', fontSize: 14, marginBottom: 8 }}>{r.description}</p>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
                {r.origin && <span style={{ color: '#e8a020' }}>📍 From: {r.origin}</span>}
                {r.destination && <span style={{ color: '#27ae60' }}>🏁 To: {r.destination}</span>}
              </div>
              {r.hazards && (
                <div style={{ marginTop: 8, color: '#e67e22', fontSize: 13 }}>⚠️ {r.hazards}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tips Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {TIPS.map(t => (
          <div key={t.title} className="card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
            <h4 style={{ marginBottom: 10 }}>{t.title}</h4>
            <ul style={{ paddingLeft: 16, color: '#8892a4', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {t.items.map(i => <li key={i}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {/* Emergency Radio */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>📻 Emergency Radio Stations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {RADIO.map(r => (
            <div key={r.name} style={{ background: '#0f1e3d', borderRadius: 8, padding: 14 }}>
              <div style={{ fontWeight: 700, color: '#e8a020', fontSize: 16 }}>{r.freq}</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
              <div style={{ color: '#8892a4', fontSize: 12 }}>{r.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Numbers */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 16 }}>📞 Emergency Numbers</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { num: '110', label: 'Police' },
            { num: '119', label: 'Ambulance' },
            { num: '110', label: 'Fire Brigade' },
            { num: '1-888-ODPEM-07', label: 'ODPEM Hotline' },
            { num: '1-888-429-5465', label: 'Red Cross' },
          ].map(e => (
            <a key={e.num} href={`tel:${e.num}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#0f1e3d', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#e8a020' }}>{e.num}</div>
                <div style={{ color: '#8892a4', fontSize: 12 }}>{e.label}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
