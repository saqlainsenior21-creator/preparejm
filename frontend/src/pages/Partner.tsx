import { Link } from 'react-router-dom'

export default function Partner() {
  const RED = '#C8102E'
  const GOLD = '#FFB81C'
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: RED, color: 'white', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🚨</span>
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>PrepareJM</span>
        <span style={{ opacity: 0.6, margin: '0 0.5rem' }}>|</span>
        <span style={{ opacity: 0.85 }}>ODPEM Partnership</span>
      </div>

      <div style={{ maxWidth: 860, margin: '3rem auto', padding: '0 1.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: RED, fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>← Back</Link>

        <div style={{ background: `linear-gradient(135deg, ${RED} 0%, #8B0820 100%)`, color: 'white', borderRadius: 16, padding: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,184,28,0.2)', border: '1px solid rgba(255,184,28,0.4)', borderRadius: 999, padding: '0.4rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: GOLD, fontWeight: 600 }}>
            🇯🇲 Partnership Proposal — Office of Disaster Preparedness & Emergency Management (ODPEM)
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Partner with PrepareJM</h1>
          <p style={{ opacity: 0.9, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            PrepareJM is a live, cloud-based disaster preparedness and emergency alert platform built for Jamaica's emergency management system — 14 parishes covered, real-time SMS broadcasting via Twilio.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: RED, marginBottom: '1.25rem' }}>What PrepareJM Offers</h2>
          {[
            ['Emergency SMS Broadcasting', 'Send real-time SMS alerts to thousands of registered residents in seconds via Twilio — by parish, region, or nationwide.'],
            ['Shelter Management', 'Live shelter directory with capacity, location, and current occupancy. Citizens find the nearest shelter on the map.'],
            ['Citizen Check-In Safe', 'Residents can tap "Check In Safe" — automatically notifies up to 5 saved emergency contacts via SMS.'],
            ['Evacuation Routes', 'Pre-mapped evacuation routes for hurricanes, floods, and other emergencies — accessible by every Jamaican citizen.'],
            ['ODPEM Coordinator Dashboard', 'Real-time view of active alerts, shelter occupancy, check-ins, and parish-level emergency status.'],
            ['Multi-Hazard Support', 'Built for hurricanes, floods, earthquakes, tsunamis, fires, and civil emergencies.'],
            ['Role-Based Access', 'Separate dashboards for citizens, coordinators (NDM/parish), and ODPEM admins.'],
            ['Audit Trail', 'Every alert, every check-in, every coordinator action logged with timestamp and user.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ color: RED, fontSize: '1.2rem', flexShrink: 0 }}>✓</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</div>
                <div style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fee2e2', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem', border: `1px solid ${RED}` }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: RED, marginBottom: '1rem' }}>Try the Live Demo</h2>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Public Citizen Access (no login)</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Visit /shelters or /evacuate for public emergency info</div>
          </div>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: RED, color: 'white', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' }}>Access Live Platform</Link>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: RED, marginBottom: '0.5rem' }}>Get in Touch</h2>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
            <a href="mailto:saqlain@schooltrackjm.com" style={{ color: RED, fontWeight: 600 }}>✉ saqlain@schooltrackjm.com</a>
            <a href="tel:+18768751969" style={{ color: RED, fontWeight: 600 }}>📞 +1 (876) 875-1969 / +1 (876) 234-5464</a>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 8, fontSize: '0.82rem', color: '#94a3b8' }}>
            Saqlain Senior | Founder, PrepareJM | Black River, St. Elizabeth, Jamaica 🇯🇲
          </div>
        </div>
      </div>
    </div>
  )
}
