const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'preparejm.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ─────────────────────────────────────────────────────────────────

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  parish TEXT,
  role TEXT NOT NULL DEFAULT 'citizen',
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'GENERAL',
  severity TEXT NOT NULL DEFAULT 'INFO',
  parishes TEXT NOT NULL DEFAULT 'ALL',
  issued_by TEXT,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  sms_sent INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shelters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  parish TEXT NOT NULL,
  lat REAL,
  lng REAL,
  capacity INTEGER DEFAULT 0,
  occupancy INTEGER DEFAULT 0,
  type TEXT DEFAULT 'GENERAL',
  facilities TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS evacuation_routes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parish TEXT NOT NULL,
  from_area TEXT NOT NULL,
  to_shelter TEXT NOT NULL,
  instructions TEXT NOT NULL,
  distance_km REAL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS check_ins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  alert_id TEXT,
  status TEXT NOT NULL DEFAULT 'SAFE',
  lat REAL,
  lng REAL,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT DEFAULT 'Family',
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

// ── Seed Data ──────────────────────────────────────────────────────────────

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (count > 0) return;

  // Admin + coordinators
  const adminId = uuidv4();
  db.prepare(`INSERT INTO users (id,name,email,phone,parish,role,password_hash) VALUES (?,?,?,?,?,?,?)`)
    .run(adminId, 'PrepareJM Admin', 'admin@preparejm.com', '+18764000001', 'Kingston', 'admin', bcrypt.hashSync('Admin2026!', 10));

  const parishes = ['Kingston','St. Andrew','St. Thomas','Portland','St. Mary',
    'St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine'];

  parishes.forEach(p => {
    db.prepare(`INSERT INTO users (id,name,email,phone,parish,role,password_hash) VALUES (?,?,?,?,?,?,?)`)
      .run(uuidv4(), `${p} Coordinator`, `coord.${p.toLowerCase().replace(/[ .]/g,'')}@odpem.gov.jm`,
        '+18764000002', p, 'coordinator', bcrypt.hashSync('Coord2026!', 10));
  });

  // Real Jamaica shelters
  const shelters = [
    { name: 'Norman Manley High School', address: 'Norman Manley Blvd', parish: 'Kingston', lat: 17.9482, lng: -76.7765, capacity: 500, type: 'HURRICANE' },
    { name: 'Tinson Pen Aerodrome Shelter', address: 'Marcus Garvey Drive', parish: 'Kingston', lat: 17.9833, lng: -76.8167, capacity: 300, type: 'HURRICANE' },
    { name: 'Half Way Tree Community Centre', address: 'Maxfield Ave', parish: 'St. Andrew', lat: 17.9993, lng: -76.7940, capacity: 400, type: 'GENERAL' },
    { name: 'Papine High School', address: 'Gordon Town Rd', parish: 'St. Andrew', lat: 18.0321, lng: -76.7548, capacity: 350, type: 'HURRICANE' },
    { name: 'Port Antonio Community Centre', address: 'Harbour St', parish: 'Portland', lat: 18.1782, lng: -76.4514, capacity: 250, type: 'HURRICANE' },
    { name: 'St. Ann\'s Bay Community Centre', address: 'Main St', parish: 'St. Ann', lat: 18.4333, lng: -77.2000, capacity: 300, type: 'HURRICANE' },
    { name: 'Montego Bay Community Centre', address: 'Barnett St', parish: 'St. James', lat: 18.4762, lng: -77.9225, capacity: 600, type: 'HURRICANE' },
    { name: 'Savanna-la-Mar Sports Complex', address: 'Great George St', parish: 'Westmoreland', lat: 18.2167, lng: -78.1333, capacity: 800, type: 'HURRICANE' },
    { name: 'Black River High School', address: 'North St', parish: 'St. Elizabeth', lat: 17.9667, lng: -77.8500, capacity: 400, type: 'HURRICANE' },
    { name: 'Mandeville Community Centre', address: 'Ward Ave', parish: 'Manchester', lat: 18.0411, lng: -77.5028, capacity: 450, type: 'GENERAL' },
    { name: 'May Pen Community Centre', address: 'Manchester Ave', parish: 'Clarendon', lat: 17.9659, lng: -77.2463, capacity: 350, type: 'HURRICANE' },
    { name: 'Spanish Town Civic Centre', address: 'Constitution St', parish: 'St. Catherine', lat: 17.9909, lng: -76.9531, capacity: 500, type: 'HURRICANE' },
    { name: 'Morant Bay Town Hall', address: 'Queen St', parish: 'St. Thomas', lat: 17.8823, lng: -76.4076, capacity: 200, type: 'HURRICANE' },
    { name: 'Lucea Town Centre', address: 'Main St', parish: 'Hanover', lat: 18.4509, lng: -78.1735, capacity: 200, type: 'HURRICANE' },
  ];

  shelters.forEach(s => {
    db.prepare(`INSERT INTO shelters (id,name,address,parish,lat,lng,capacity,occupancy,type,facilities) VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .run(uuidv4(), s.name, s.address, s.parish, s.lat, s.lng, s.capacity, 0, s.type,
        'Water,Restrooms,First Aid');
  });

  // Evacuation routes
  const routes = [
    { name: 'Kingston Coastal Evacuation', parish: 'Kingston', from_area: 'Portmore / Washington Gardens', to_shelter: 'Norman Manley High School', instructions: 'Travel east on Portmore causeway → Spanish Town Rd → Marcus Garvey Drive → Norman Manley Blvd. Avoid low-lying areas near Kingston Harbour.', distance_km: 12 },
    { name: 'St. James North Coast Route', parish: 'St. James', from_area: 'Rose Hall / Ironshore', to_shelter: 'Montego Bay Community Centre', instructions: 'Head inland on Fairview Ave → Howard Cooke Blvd → Barnett St. Avoid coastal roads during storm surge warnings.', distance_km: 8 },
    { name: 'Portland River Flood Route', parish: 'Portland', from_area: 'Buff Bay / Hope Bay', to_shelter: 'Port Antonio Community Centre', instructions: 'Travel on A4 highway westbound → Junction Road → Harbour Street. Avoid river crossings if flooding reported.', distance_km: 25 },
    { name: 'Westmoreland Hurricane Route', parish: 'Westmoreland', from_area: 'Negril / Sheffield', to_shelter: 'Savanna-la-Mar Sports Complex', instructions: 'Take A2 highway east toward Savanna-la-Mar. If coastal flooding, use interior roads via Little London.', distance_km: 18 },
    { name: 'St. Elizabeth Southern Route', parish: 'St. Elizabeth', from_area: 'Treasure Beach / Gut River', to_shelter: 'Black River High School', instructions: 'Head north on local roads to Black River main road. Avoid Gut River crossing during heavy rain.', distance_km: 22 },
  ];

  routes.forEach(r => {
    db.prepare(`INSERT INTO evacuation_routes (id,name,parish,from_area,to_shelter,instructions,distance_km) VALUES (?,?,?,?,?,?,?)`)
      .run(uuidv4(), r.name, r.parish, r.from_area, r.to_shelter, r.instructions, r.distance_km);
  });

  // Sample active alert
  db.prepare(`INSERT INTO alerts (id,title,message,type,severity,parishes,issued_by,active) VALUES (?,?,?,?,?,?,?,?)`)
    .run(uuidv4(),
      'Hurricane Season Advisory',
      'The Caribbean Hurricane Season runs June 1 – November 30. Ensure your emergency kit is stocked: 3 days water, non-perishable food, flashlight, batteries, first aid kit, important documents. Know your nearest shelter.',
      'HURRICANE', 'INFO', 'ALL', adminId, 1);
}

seedIfEmpty();

module.exports = db;
