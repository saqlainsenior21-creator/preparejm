const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const { notifyCheckinReceived } = require('../sms');

// POST /api/checkins — citizen checks in
router.post('/', auth, async (req, res) => {
  const { alert_id, status = 'SAFE', lat, lng, message } = req.body;
  const validStatuses = ['SAFE', 'NEED_HELP', 'EVACUATING', 'SHELTERED'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const id = uuidv4();
  db.prepare('INSERT INTO check_ins (id,user_id,alert_id,status,lat,lng,message) VALUES (?,?,?,?,?,?,?)')
    .run(id, req.user.id, alert_id || null, status, lat || null, lng || null, message || null);

  // Notify emergency contacts
  try {
    const contacts = db.prepare('SELECT * FROM emergency_contacts WHERE user_id=?').all(req.user.id);
    for (const c of contacts) {
      await notifyCheckinReceived(c.phone, req.user.name, status);
    }
  } catch(e) {}

  res.status(201).json({ id, status, message: `Check-in recorded: ${status}` });
});

// GET /api/checkins/me — citizen's own check-in history
router.get('/me', auth, (req, res) => {
  const checkins = db.prepare('SELECT * FROM check_ins WHERE user_id=? ORDER BY created_at DESC LIMIT 20')
    .all(req.user.id);
  res.json(checkins);
});

// GET /api/checkins — coordinator/admin sees all for their parish
router.get('/', auth, requireRole('coordinator', 'admin'), (req, res) => {
  const checkins = db.prepare(`
    SELECT ci.*, u.name as user_name, u.phone as user_phone, u.parish as user_parish
    FROM check_ins ci JOIN users u ON ci.user_id=u.id
    ORDER BY ci.created_at DESC LIMIT 200
  `).all();
  res.json(checkins);
});

// Emergency contacts
router.get('/contacts', auth, (req, res) => {
  const contacts = db.prepare('SELECT * FROM emergency_contacts WHERE user_id=?').all(req.user.id);
  res.json(contacts);
});

router.post('/contacts', auth, (req, res) => {
  const { name, phone, relationship } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
  const id = uuidv4();
  db.prepare('INSERT INTO emergency_contacts (id,user_id,name,phone,relationship) VALUES (?,?,?,?,?)')
    .run(id, req.user.id, name, phone, relationship || 'Family');
  res.status(201).json({ id, name, phone, relationship });
});

router.delete('/contacts/:id', auth, (req, res) => {
  db.prepare('DELETE FROM emergency_contacts WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

module.exports = router;
