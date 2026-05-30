const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const { broadcastAlert } = require('../sms');

// GET /api/alerts — public, returns active alerts (filtered by parish if ?parish=)
router.get('/', (req, res) => {
  const { parish, limit = 20 } = req.query;
  let alerts;
  if (parish && parish !== 'ALL') {
    alerts = db.prepare(`
      SELECT * FROM alerts WHERE active=1
      AND (parishes='ALL' OR parishes LIKE ? OR parishes LIKE ? OR parishes LIKE ? OR parishes LIKE ?)
      ORDER BY issued_at DESC LIMIT ?
    `).all(`%${parish}%`, `${parish},%`, `%,${parish}`, parish, Number(limit));
  } else {
    alerts = db.prepare('SELECT * FROM alerts WHERE active=1 ORDER BY issued_at DESC LIMIT ?')
      .all(Number(limit));
  }
  res.json(alerts);
});

// GET /api/alerts/all — coordinator/admin sees all including inactive
router.get('/all', auth, requireRole('coordinator', 'admin'), (req, res) => {
  const alerts = db.prepare('SELECT * FROM alerts ORDER BY issued_at DESC LIMIT 100').all();
  res.json(alerts);
});

// POST /api/alerts — issue new alert (coordinator/admin)
router.post('/', auth, requireRole('coordinator', 'admin'), async (req, res) => {
  const { title, message, type = 'GENERAL', severity = 'INFO', parishes = 'ALL', expires_at } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Title and message required' });

  const id = uuidv4();
  db.prepare(`INSERT INTO alerts (id,title,message,type,severity,parishes,issued_by,expires_at) VALUES (?,?,?,?,?,?,?,?)`)
    .run(id, title, message, type, severity, parishes, req.user.id, expires_at || null);

  // Broadcast SMS to affected users
  let smsCount = 0;
  try {
    let users;
    if (parishes === 'ALL') {
      users = db.prepare('SELECT phone FROM users WHERE active=1 AND phone IS NOT NULL').all();
    } else {
      const parishList = parishes.split(',').map(p => p.trim());
      const placeholders = parishList.map(() => '?').join(',');
      users = db.prepare(`SELECT phone FROM users WHERE active=1 AND phone IS NOT NULL AND parish IN (${placeholders})`)
        .all(...parishList);
    }
    const alert = db.prepare('SELECT * FROM alerts WHERE id=?').get(id);
    smsCount = await broadcastAlert(alert, users);
    db.prepare('UPDATE alerts SET sms_sent=? WHERE id=?').run(smsCount, id);
  } catch(e) {}

  const alert = db.prepare('SELECT * FROM alerts WHERE id=?').get(id);
  res.status(201).json({ ...alert, sms_sent: smsCount });
});

// PATCH /api/alerts/:id — update (coordinator/admin)
router.patch('/:id', auth, requireRole('coordinator', 'admin'), (req, res) => {
  const { title, message, active, severity } = req.body;
  db.prepare('UPDATE alerts SET title=COALESCE(?,title), message=COALESCE(?,message), severity=COALESCE(?,severity), active=COALESCE(?,active) WHERE id=?')
    .run(title || null, message || null, severity || null, active !== undefined ? (active ? 1 : 0) : null, req.params.id);
  res.json(db.prepare('SELECT * FROM alerts WHERE id=?').get(req.params.id));
});

// DELETE /api/alerts/:id — deactivate
router.delete('/:id', auth, requireRole('coordinator', 'admin'), (req, res) => {
  db.prepare('UPDATE alerts SET active=0 WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
