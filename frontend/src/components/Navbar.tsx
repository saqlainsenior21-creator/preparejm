import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, isAuth, isCoord, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const active = (p: string) => location.pathname === p ? 'nav-active' : '';

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          🛡️ <span style={{ color: '#e8a020' }}>Prepare</span>JM
        </Link>

        {/* Desktop links */}
        <div style={styles.links}>
          <Link to="/shelters" style={styles.link} className={active('/shelters')}>Shelters</Link>
          <Link to="/evacuate" style={styles.link} className={active('/evacuate')}>Evacuate</Link>
          {isAuth && <Link to="/checkin" style={styles.link} className={active('/checkin')}>Check In</Link>}
          {isCoord && <Link to="/coord" style={styles.link} className={active('/coord')}>Command</Link>}
          {isAdmin && <Link to="/admin" style={styles.link} className={active('/admin')}>Admin</Link>}
        </div>

        <div style={styles.actions}>
          {isAuth ? (
            <>
              <span style={{ color: '#8892a4', fontSize: 13 }}>{user?.name}</span>
              <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"><button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}>Login</button></Link>
              <Link to="/register"><button className="btn-primary" style={{ padding: '6px 14px', fontSize: 13 }}>Register</button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    background: '#0a1428',
    borderBottom: '1px solid #1a3060',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    padding: '0 20px',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    height: 56,
  },
  logo: {
    fontSize: 20,
    fontWeight: 800,
    color: '#fff',
    textDecoration: 'none',
    marginRight: 'auto',
    letterSpacing: '-0.5px',
  },
  links: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  },
  link: {
    color: '#8892a4',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  actions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
};
