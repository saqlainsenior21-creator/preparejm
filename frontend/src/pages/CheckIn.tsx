import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const STATUSES = [
  { value: 'SAFE', label: 'I am Safe', icon: '✅', color: '#27ae60', desc: 'You are safe and not in immediate danger' },
  { value: 'NEED_HELP', label: 'Need Help', icon: '🆘', color: '#c0392b', desc: 'You need emergency assistance' },
  { value: 'EVACUATING', label: 'Evacuating', icon: '🚗', color: '#e67e22', desc: 'You are currently evacuating' },
  { value: 'SHELTERED', label: 'At Shelter', icon: '🏠', color: '#8e44ad', desc: 'You are at an emergency shelter' },
];

export default function CheckIn() {
  const { token } = useAuth();
  const [status, setStatus] = useState('SAFE');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: 'Family' });
  const [addingContact, setAddingContact] = useState(false);

  useEffect(() => {
    Promise.all([
      api.myCheckins(token!),
      api.getContacts(token!),
    ]).then(([c, ct]) => { setHistory(c); setContacts(ct); }).catch(() => {});
  }, [done]);

  const submit = async () => {
    setLoading(true);
    try {
      await api.checkin({ status, message: message || undefined }, token!);
      setDone(true);
      setMessage('');
      setTimeout(() => setDone(false), 4000);
      const c = await api.myCheckins(token!);
      setHistory(c);
    } catch (e: any) {
      alert(e.message);
    } finally { setLoading(false); }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    setAddingContact(true);
    try {
      await api.addContact(newContact, token!);
      const ct = await api.getContacts(token!);
      setContacts(ct);
      setNewContact({ name: '', phone: '', relationship: 'Family' });
    } catch (e: any) { alert(e.message); }
    finally { setAddingContact(false); }
  };

  const removeContact = async (id: string) => {
    await api.deleteContact(id, token!);
    setContacts(c => c.filter(x => x.id !== id));
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ marginBottom: 4 }}>✅ Safety Check-In</h1>
      <p style={{ color: '#8892a4', fontSize: 14, marginBottom: 28 }}>
        Let family and authorities know your status. SMS alerts sent to your emergency contacts.
      </p>

      {/* Status selector */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>My Current Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {STATUSES.map(s => (
            <div
              key={s.value}
              onClick={() => setStatus(s.value)}
              style={{
                background: status === s.value ? `${s.color}22` : '#0f1e3d',
                border: `2px solid ${status === s.value ? s.color : '#1a3060'}`,
                borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>{s.label}</div>
              <div style={{ color: '#8892a4', fontSize: 12 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: '#8892a4', marginBottom: 6, display: 'block' }}>Optional Message</label>
          <textarea
            rows={2}
            placeholder="Add more details (e.g., location, what you need)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        {done && (
          <div style={{ background: '#0d2e16', border: '1px solid #27ae60', borderRadius: 8, padding: '12px 16px', color: '#27ae60', marginBottom: 12 }}>
            ✅ Check-in recorded! Your emergency contacts have been notified.
          </div>
        )}

        <button className="btn-primary" onClick={submit} disabled={loading} style={{ width: '100%', padding: 14 }}>
          {loading ? 'Sending...' : `🛡️ Check In as ${STATUSES.find(s => s.value === status)?.label}`}
        </button>
      </div>

      {/* Emergency Contacts */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>👨‍👩‍👧 Emergency Contacts</h3>
        <p style={{ color: '#8892a4', fontSize: 13, marginBottom: 16 }}>
          These people receive an SMS when you check in
        </p>

        {contacts.length === 0 && (
          <div style={{ color: '#8892a4', fontSize: 14, textAlign: 'center', padding: '12px 0 20px' }}>
            No emergency contacts yet — add at least one
          </div>
        )}

        {contacts.map(c => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a3060' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
              <div style={{ color: '#8892a4', fontSize: 12 }}>{c.phone} · {c.relationship}</div>
            </div>
            <button onClick={() => removeContact(c.id)} className="btn-danger" style={{ padding: '4px 12px', fontSize: 12 }}>Remove</button>
          </div>
        ))}

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input placeholder="Name" value={newContact.name} onChange={e => setNewContact(n => ({ ...n, name: e.target.value }))} />
          <input placeholder="+1876..." value={newContact.phone} onChange={e => setNewContact(n => ({ ...n, phone: e.target.value }))} />
          <select value={newContact.relationship} onChange={e => setNewContact(n => ({ ...n, relationship: e.target.value }))}>
            <option>Family</option><option>Spouse</option><option>Parent</option><option>Child</option><option>Friend</option><option>Neighbor</option>
          </select>
          <button className="btn-green" onClick={addContact} disabled={addingContact}>{addingContact ? '...' : '+ Add Contact'}</button>
        </div>
      </div>

      {/* History */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>📋 Check-In History</h3>
        {history.length === 0 ? (
          <div style={{ color: '#8892a4', fontSize: 14, textAlign: 'center', padding: 20 }}>No check-ins yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map((h: any) => (
              <div key={h.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #1a3060' }}>
                <span style={{ fontSize: 20 }}>{statusIcon(h.status)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{h.status.replace('_', ' ')}</div>
                  {h.message && <div style={{ color: '#8892a4', fontSize: 13 }}>{h.message}</div>}
                </div>
                <div style={{ color: '#6a7a94', fontSize: 12, whiteSpace: 'nowrap' }}>
                  {new Date(h.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function statusIcon(s: string) {
  return s === 'SAFE' ? '✅' : s === 'NEED_HELP' ? '🆘' : s === 'EVACUATING' ? '🚗' : '🏠';
}
