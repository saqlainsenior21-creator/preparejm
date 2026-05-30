const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { auth, JWT_SECRET } = require('../middleware/auth');

router.post('/register', (req, res) => {
  const { name, email, password, phone, parish } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
  const exists = db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id,name,email,phone,parish,role,password_hash) VALUES (?,?,?,?,?,?,?)')
    .run(id, name.trim(), email.toLowerCase(), phone || null, parish || null, 'citizen', hash);
  const user = { id, name: name.trim(), email: email.toLowerCase(), phone, parish, role: 'citizen' };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = db.prepare('SELECT * FROM users WHERE email=? AND active=1').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid email or password' });
  const payload = { id: user.id, name: user.name, email: user.email, phone: user.phone, parish: user.parish, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: payload });
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id,name,email,phone,parish,role FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

router.patch('/me', auth, (req, res) => {
  const { name, phone, parish } = req.body;
  db.prepare('UPDATE users SET name=COALESCE(?,name), phone=COALESCE(?,phone), parish=COALESCE(?,parish) WHERE id=?')
    .run(name || null, phone || null, parish || null, req.user.id);
  const user = db.prepare('SELECT id,name,email,phone,parish,role FROM users WHERE id=?').get(req.user.id);
  res.json(user);
});

module.exports = router;
