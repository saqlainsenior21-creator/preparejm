import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Landing() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getAlerts().then(setAlerts).catch(() => {});
    api.health().then(setStats).catch(() => {});
  }, []);

  const emergency = alerts.filter(a => a.severity === 'EMERGENCY');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 60px' }}>

      {/* Emergency Banner */}
      {emergency.length > 0 && (
        <div style={{ background: '#c0392b', padding: '12px 20px', borderRadius: 8, margin: '16px 0', animation: 'pulse 2s infinite' }}>
          <strong>🚨 EMERGENCY ALERT</strong> — {emergency[0].title}: {emergency[0].message}
        </div>
      )}

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 0 40px' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🛡️</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
          <span style={{ color: '#e8a020' }}>Prepare</span>JM
        </h1>
        <p style={{ fontSize: 20, color: '#8892a4', maxWidth: 560, margin: '0 auto 8px' }}>
          Jamaica's Official Disaster Preparedness & Emergency Alert System
        </p>
        <p style={{ color: '#6a7a94', fontSize: 14 }}>In partnership with ODPEM · Local Municipalities · Government of Jamaica</p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <Link to="/register">
            <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
              Register for Alerts
            </button>
          </Link>
          <Link to="/shelters">
            <button className="btn-ghost" style={{ padding: '14px 32px', fontSize: 16 }}>
              Find Shelters
            </button>
          </Link>
          <Link to="/evacuate">
            <button className="btn-ghost" style={{ padding: '14px 32px', fontSize: 16 }}>
              Evacuation Routes
            </button>
          </Link>
        </div>
      </div>

      {/* Live Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 48 }}>
          {[
            { label: 'Active Alerts', value: stats.alerts, icon: '⚠️', color: '#e8a020' },
            { label: 'Open Shelters', value: stats.shelters, icon: '🏫', color: '#27ae60' },
            { label: 'Check-ins Today', value: stats.checkins_today, icon: '✅', color: '#2980b9' },
            { label: 'System Status', value: 'LIVE', icon: '🟢', color: '#27ae60' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: '#8892a4', fontSize: 12 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ marginBottom: 16 }}>⚠️ Active Alerts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.slice(0, 3).map(a => (
              <div key={a.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: `4px solid ${severityColor(a.severity)}` }}>
                <span>{severityIcon(a.severity)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{a.title}</div>
                  <div style={{ color: '#8892a4', fontSize: 13 }}>{a.message}</div>
                  <div style={{ fontSize: 11, color: '#6a7a94', marginTop: 4 }}>
                    {a.parishes} · {new Date(a.issued_at).toLocaleString()}
                  </div>
                </div>
                <span className={`badge badge-${a.severity.toLowerCase()}`}>{a.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Protect Your Family</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#8892a4', fontSize: 14 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Partners */}
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <h2 style={{ marginBottom: 8 }}>Official Partners</h2>
        <p style={{ color: '#8892a4', marginBottom: 24 }}>PrepareJM works alongside Jamaica's leading emergency management bodies</p>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', color: '#8892a4', fontSize: 14 }}>
          <span>🏛️ ODPEM</span>
          <span>🏥 Ministry of Health</span>
          <span>🌊 JRC (Red Cross)</span>
          <span>🏫 14 Parish Councils</span>
          <span>👮 JCF</span>
          <span>🚒 JFB</span>
        </div>
      </div>

      {/* Offline notice */}
      <div style={{ textAlign: 'center', marginTop: 32, color: '#6a7a94', fontSize: 13 }}>
        📱 Works offline — Install on your phone for emergency access without internet
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: '🚨', title: 'Real-Time Alerts', desc: 'Instant emergency notifications for hurricanes, floods, earthquakes and more. SMS alerts sent to your phone.' },
  { icon: '🗺️', title: 'Shelter Finder', desc: 'Interactive map of 50+ verified emergency shelters across all 14 parishes with live capacity updates.' },
  { icon: '🚗', title: 'Evacuation Routes', desc: 'Pre-planned evacuation routes for your parish with road conditions and safe passage guidance.' },
  { icon: '✅', title: 'Safety Check-In', desc: 'Let family and authorities know you are safe. Automatic SMS to your emergency contacts.' },
  { icon: '📴', title: 'Offline Ready', desc: 'Critical information cached locally. Works without internet during disasters when you need it most.' },
  { icon: '👥', title: 'Community', desc: 'Parish-level coordinators monitor your community. Trained responders on standby 24/7.' },
];

function severityColor(s: string) {
  return s === 'EMERGENCY' ? '#c0392b' : s === 'WATCH' ? '#e67e22' : s === 'WARNING' ? '#f39c12' : '#2980b9';
}

function severityIcon(s: string) {
  return s === 'EMERGENCY' ? '🚨' : s === 'WATCH' ? '⚠️' : s === 'WARNING' ? '⚠️' : 'ℹ️';
}
