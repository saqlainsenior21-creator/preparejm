import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../api';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const PARISHES = ['','Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine'];

const makeIcon = (color: string) => L.divIcon({
  html: `<div style="background:${color};width:20px;height:20px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function ShelterMap() {
  const [shelters, setShelters] = useState<any[]>([]);
  const [parish, setParish] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getShelters(parish || undefined).then(setShelters).catch(() => {}).finally(() => setLoading(false));
  }, [parish]);

  const totalCapacity = shelters.reduce((s, sh) => s + sh.capacity, 0);
  const totalAvailable = shelters.reduce((s, sh) => s + sh.available, 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1>🏫 Emergency Shelters</h1>
        <p style={{ color: '#8892a4', fontSize: 14 }}>All verified emergency shelters across Jamaica</p>
      </div>

      {/* Controls + Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={parish} onChange={e => setParish(e.target.value)} style={{ width: 200 }}>
          {PARISHES.map(p => <option key={p} value={p}>{p || 'All Parishes'}</option>)}
        </select>
        <div className="card" style={{ padding: '8px 16px', display: 'flex', gap: 20 }}>
          <span style={{ fontSize: 13 }}>🏫 <strong>{shelters.length}</strong> shelters</span>
          <span style={{ fontSize: 13 }}>✅ <strong style={{ color: '#27ae60' }}>{totalAvailable}</strong> spaces available</span>
          <span style={{ fontSize: 13 }}>👥 <strong>{totalCapacity}</strong> total capacity</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Map */}
        <div style={{ height: 520, borderRadius: 12, overflow: 'hidden', border: '1px solid #1a3060' }}>
          <MapContainer center={[18.1096, -77.2975]} zoom={9} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {shelters.filter(s => s.lat && s.lng).map(s => (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={makeIcon(s.availability_pct > 50 ? '#27ae60' : s.availability_pct > 20 ? '#e67e22' : '#c0392b')}
                eventHandlers={{ click: () => setSelected(s) }}
              >
                <Popup>
                  <div style={{ minWidth: 200 }}>
                    <strong>{s.name}</strong><br />
                    <span style={{ fontSize: 12, color: '#666' }}>{s.address}</span><br />
                    <span style={{ fontSize: 12 }}>Capacity: {s.available}/{s.capacity} available</span><br />
                    <span style={{ fontSize: 12 }}>Type: {s.type}</span>
                    {s.facilities && <><br /><span style={{ fontSize: 11, color: '#888' }}>{s.facilities}</span></>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* List */}
        <div style={{ height: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading && <div style={{ textAlign: 'center', padding: 40, color: '#8892a4' }}>Loading shelters...</div>}
          {!loading && shelters.map(s => (
            <div
              key={s.id}
              className="card"
              style={{ cursor: 'pointer', borderColor: selected?.id === s.id ? '#e8a020' : '#2a3d6b', padding: 14 }}
              onClick={() => setSelected(s)}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
              <div style={{ color: '#8892a4', fontSize: 12, marginTop: 2 }}>{s.parish} · {s.type}</div>
              <div style={{ color: '#6a7a94', fontSize: 12 }}>{s.address}</div>
              {s.facilities && <div style={{ color: '#6a7a94', fontSize: 11, marginTop: 4 }}>{s.facilities}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <div style={{ flex: 1, background: '#1a3060', borderRadius: 4, height: 6 }}>
                  <div style={{
                    width: `${s.availability_pct}%`,
                    background: s.availability_pct > 50 ? '#27ae60' : s.availability_pct > 20 ? '#e67e22' : '#c0392b',
                    height: '100%', borderRadius: 4
                  }} />
                </div>
                <span style={{ fontSize: 12, color: '#8892a4', whiteSpace: 'nowrap' }}>
                  {s.available} / {s.capacity}
                </span>
              </div>
            </div>
          ))}
          {!loading && shelters.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#8892a4' }}>No shelters found</div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 13, color: '#8892a4' }}>
        <span>🟢 &gt;50% available</span>
        <span>🟠 20-50% available</span>
        <span>🔴 &lt;20% available</span>
      </div>
    </div>
  );
}
