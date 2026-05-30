const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/shelters — public
router.get('/', (req, res) => {
  const { parish } = req.query;
  let shelters;
  if (parish) {
    shelters = db.prepare('SELECT * FROM shelters WHERE active=1 AND parish=? ORDER BY name').all(parish);
  } else {
    shelters = db.prepare('SELECT * FROM shelters WHERE active=1 ORDER BY parish, name').all();
  }
  // Add availability percentage
  shelters = shelters.map(s => ({
    ...s,
    available: Math.max(0, s.capacity - s.occupancy),
    availability_pct: s.capacity > 0 ? Math.round((1 - s.occupancy / s.capacity) * 100) : 100,
  }));
  res.json(shelters);
});

// PATCH /api/shelters/:id/occupancy — update headcount (coordinator)
router.patch('/:id/occupancy', auth, requireRole('coordinator', 'admin'), (req, res) => {
  const { occupancy } = req.body;
  if (occupancy === undefined || occupancy < 0) return res.status(400).json({ error: 'Valid occupancy required' });
  db.prepare('UPDATE shelters SET occupancy=? WHERE id=?').run(occupancy, req.params.id);
  res.json(db.prepare('SELECT * FROM shelters WHERE id=?').get(req.params.id));
});

// POST /api/shelters — add shelter (admin)
router.post('/', auth, requireRole('admin'), (req, res) => {
  const { name, address, parish, lat, lng, capacity, type, facilities } = req.body;
  if (!name || !address || !parish) return res.status(400).json({ error: 'Name, address, parish required' });
  const id = uuidv4();
  db.prepare('INSERT INTO shelters (id,name,address,parish,lat,lng,capacity,type,facilities) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, name, address, parish, lat || null, lng || null, capacity || 0, type || 'GENERAL', facilities || '');
  res.status(201).json(db.prepare('SELECT * FROM shelters WHERE id=?').get(id));
});

// GET /api/evacuation — get evacuation routes
router.get('/evacuation', (req, res) => {
  const { parish } = req.query;
  let routes;
  if (parish) {
    routes = db.prepare('SELECT * FROM evacuation_routes WHERE active=1 AND parish=? ORDER BY name').all(parish);
  } else {
    routes = db.prepare('SELECT * FROM evacuation_routes WHERE active=1 ORDER BY parish, name').all();
  }
  res.json(routes);
});

module.exports = router;
