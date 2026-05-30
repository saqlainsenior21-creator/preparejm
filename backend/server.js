require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4004;

// Logging
app.use(pinoHttp({ level: process.env.LOG_LEVEL || 'info' }));

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many requests' } }));
app.use('/api/alerts', rateLimit({ windowMs: 60 * 1000, max: 60 }));
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/shelters', require('./routes/shelters'));
app.use('/api/checkins', require('./routes/checkins'));

// Health check
app.get('/api/health', (req, res) => {
  const db = require('./db');
  const stats = {
    status: 'ok',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    alerts: db.prepare('SELECT COUNT(*) as c FROM alerts WHERE active=1').get().c,
    shelters: db.prepare('SELECT COUNT(*) as c FROM shelters WHERE active=1').get().c,
    checkins_today: db.prepare("SELECT COUNT(*) as c FROM check_ins WHERE created_at >= date('now')").get().c,
  };
  res.json(stats);
});

// Serve frontend in production
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist');
app.use(express.static(FRONTEND_DIST));
app.get('*', (req, res) => {
  const indexPath = path.join(FRONTEND_DIST, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) res.status(200).json({ message: 'PrepareJM API v1.0.0' });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🛡️  PrepareJM backend running on port ${PORT}`);
});

module.exports = app;
