const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { initialDestinations } = require('../seed/seedData');

let dbClient = null;
let dbType = 'sqlite'; // 'postgres' or 'sqlite'
let initPromise = null;

function shouldUsePostgresSsl(databaseUrl) {
  const sslMode = (process.env.PGSSLMODE || '').toLowerCase();
  if (sslMode === 'disable') return false;
  if (['require', 'verify-ca', 'verify-full'].includes(sslMode)) return true;

  try {
    const hostname = new URL(databaseUrl).hostname.toLowerCase();
    return !['localhost', '127.0.0.1', '::1', 'postgres'].includes(hostname);
  } catch {
    return process.env.NODE_ENV === 'production';
  }
}

/**
 * Initialize Database Connection
 * Attempts PostgreSQL first if DATABASE_URL or PGHOST is present.
 * Falls back to built-in SQLite for zero-config offline local development.
 */
async function initDb() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const databaseUrl = process.env.DATABASE_URL;
    const pgHost = process.env.PGHOST;

    if (databaseUrl || pgHost) {
      try {
        const { Pool } = require('pg');
        const poolConfig = databaseUrl
          ? {
              connectionString: databaseUrl,
              ssl: shouldUsePostgresSsl(databaseUrl)
                ? { rejectUnauthorized: false }
                : false,
            }
          : {
              host: process.env.PGHOST || 'localhost',
              port: parseInt(process.env.PGPORT || '5432', 10),
              user: process.env.PGUSER || 'postgres',
              password: process.env.PGPASSWORD || 'postgres',
              database: process.env.PGDATABASE || 'wanderwise',
            };

        const pgPool = new Pool(poolConfig);
        await pgPool.query('SELECT 1');
        dbClient = pgPool;
        dbType = 'postgres';
        console.log('✅ Connected to PostgreSQL Database');
        await setupPostgresSchema(pgPool);
        await seedDefaultData();
        return;
      } catch (err) {
        console.warn('⚠️ PostgreSQL connection failed:', err.message);
        console.log('ℹ️ Falling back to built-in SQLite for local execution...');
      }
    }

    // SQLite fallback using built-in node:sqlite
    try {
      const { DatabaseSync } = require('node:sqlite');
      const dbPath = path.resolve(__dirname, '../../wanderwise.sqlite');
      const sqliteDb = new DatabaseSync(dbPath);
      sqliteDb.exec('PRAGMA foreign_keys = ON;');
      dbClient = sqliteDb;
      dbType = 'sqlite';
      console.log(`✅ Using built-in SQLite Database at: ${dbPath}`);
      await setupSqliteSchema(sqliteDb);
      await seedDefaultData();
    } catch (err) {
      console.error('❌ Failed to initialize database:', err);
      throw err;
    }
  })();

  return initPromise;
}

async function setupPostgresSchema(pool) {
  const schemaPath = path.resolve(__dirname, '../models/schema.sql');
  const ddl = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(ddl);
  console.log('✅ PostgreSQL Schema initialized successfully');
}

async function setupSqliteSchema(sqlite) {
  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT DEFAULT '',
      bio TEXT DEFAULT 'Passionate traveler exploring the world.',
      travel_style TEXT DEFAULT 'Cultural & Adventure',
      currency TEXT DEFAULT 'PHP',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      country TEXT DEFAULT 'Philippines',
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      best_season TEXT DEFAULT 'Dry Season (Nov-May)',
      estimated_daily_cost NUMERIC DEFAULT 3000.00,
      tags TEXT DEFAULT 'Beach, Island Hopping, Nature',
      rating NUMERIC DEFAULT 4.9,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      destination TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      description TEXT,
      estimated_budget NUMERIC DEFAULT 0.00,
      cover_image TEXT,
      status TEXT DEFAULT 'upcoming',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS itinerary_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      day_number INTEGER NOT NULL DEFAULT 1,
      activity_date TEXT,
      time_slot TEXT DEFAULT '09:00 AM',
      title TEXT NOT NULL,
      location TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      estimated_cost NUMERIC DEFAULT 0.00,
      category TEXT DEFAULT 'sightseeing',
      is_completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      expense_date TEXT NOT NULL,
      description TEXT NOT NULL,
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favorite_destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, destination_id)
    );
  `;
  sqlite.exec(ddl);
  console.log('✅ SQLite Schema initialized successfully');
}

/**
 * Execute parameterized query
 * Translates PostgreSQL $1, $2 placeholders to SQLite ? if needed.
 */
async function query(text, params = []) {
  if (!dbClient) {
    throw new Error('Database not initialized. Call initDb() first.');
  }

  if (dbType === 'postgres') {
    return await dbClient.query(text, params);
  } else {
    // SQLite adapter
    // Replace $1, $2, etc with ?
    let convertedText = text.replace(/\$([0-9]+)/g, '?');
    // node:sqlite accepts numeric SQLite booleans, while PostgreSQL expects
    // native JavaScript booleans. Normalize only at the SQLite boundary so
    // controllers can remain database-agnostic.
    const convertedParams = params.map((value) => (
      typeof value === 'boolean' ? (value ? 1 : 0) : value
    ));

    // Check if query is returning data
    const isSelect = /^\s*SELECT/i.test(convertedText);
    const hasReturning = /RETURNING/i.test(convertedText);

    try {
      const stmt = dbClient.prepare(convertedText);
      if (isSelect || hasReturning) {
        const rows = stmt.all(...convertedParams);
        return { rows, rowCount: rows.length };
      } else {
        const info = stmt.run(...convertedParams);
        return { rows: [], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
      }
    } catch (err) {
      console.error('SQL Error:', err.message, '\nQuery:', convertedText, '\nParams:', params);
      throw err;
    }
  }
}

/**
 * Seed initial sample Philippine destinations and demo user if empty
 */
async function seedDefaultData() {
  const destCheck = await query('SELECT COUNT(*) as count FROM destinations');
  const count = parseInt(destCheck.rows[0].count, 10);

  if (count === 0) {
    console.log('🌱 Seeding initial Philippine travel destinations...');
    for (const d of initialDestinations) {
      await query(
        `INSERT INTO destinations (name, region, country, description, image_url, best_season, estimated_daily_cost, tags, rating)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [d.name, d.region, d.country, d.description, d.image_url, d.best_season, d.estimated_daily_cost, d.tags, d.rating]
      );
    }
    console.log(`✅ Seeded ${initialDestinations.length} destinations.`);
  }

  // Seed demo user if demo user does not exist
  const userCheck = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', ['demo@wanderwise.com']);
  if (userCheck.rows.length === 0) {
    console.log('🌱 Seeding default demo user (demo@wanderwise.com)...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    const userRes = await query(
      `INSERT INTO users (name, email, password_hash, bio, travel_style, currency)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Maria Santos', 'demo@wanderwise.com', hash, 'Solo wanderer & island explorer from Manila.', 'Island Hopping & Food Trips', 'PHP']
    );
    const demoUserId = userRes.rows[0].id;

    // Seed a sample upcoming trip for demo user
    const tripRes = await query(
      `INSERT INTO trips (user_id, title, destination, start_date, end_date, description, estimated_budget, cover_image, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        demoUserId,
        'Palawan Island Escapade',
        'El Nido & Coron, Palawan',
        '2026-11-15',
        '2026-11-20',
        'A 5-day tropical journey exploring Big Lagoon, Secret Beach, and Shipwreck diving.',
        28000.00,
        'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1000&q=80',
        'upcoming'
      ]
    );
    const demoTripId = tripRes.rows[0].id;

    // Seed sample activities
    await query(
      `INSERT INTO itinerary_activities (trip_id, day_number, activity_date, time_slot, title, location, notes, estimated_cost, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [demoTripId, 1, '2026-11-15', '09:00 AM', 'Arrival & Check-in', 'Lio Airport, El Nido', 'Transfer to boutique resort and relax.', 1500.00, 'transport']
    );
    await query(
      `INSERT INTO itinerary_activities (trip_id, day_number, activity_date, time_slot, title, location, notes, estimated_cost, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [demoTripId, 1, '2026-11-15', '02:00 PM', 'Sunset Kayaking', 'Las Cabañas Beach', 'Paddle board and enjoy seaside smoothie.', 800.00, 'relaxation']
    );
    await query(
      `INSERT INTO itinerary_activities (trip_id, day_number, activity_date, time_slot, title, location, notes, estimated_cost, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [demoTripId, 2, '2026-11-16', '08:30 AM', 'Tour A: Big Lagoon & Shimizu Island', 'Bacuit Bay', 'Full day island hopping boat tour with grilled seafood lunch.', 2400.00, 'sightseeing']
    );

    // Seed sample expenses
    await query(
      `INSERT INTO expenses (trip_id, category, amount, expense_date, description, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [demoTripId, 'transportation', 6500.00, '2026-11-01', 'Airfare Manila to El Nido (Roundtrip)', 'AirSWIFT flight tickets']
    );
    await query(
      `INSERT INTO expenses (trip_id, category, amount, expense_date, description, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [demoTripId, 'accommodation', 10500.00, '2026-11-02', 'Boutique Beachfront Resort (4 nights)', 'Oceanview villa booking']
    );
    await query(
      `INSERT INTO expenses (trip_id, category, amount, expense_date, description, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [demoTripId, 'activities', 2400.00, '2026-11-03', 'Tour A Island Hopping Package', 'Eco-tourism fee included']
    );

    // Seed a completed trip
    const compTrip = await query(
      `INSERT INTO trips (user_id, title, destination, start_date, end_date, description, estimated_budget, cover_image, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        demoUserId,
        'Weekend Pine Breeze & Strawberries',
        'Baguio City',
        '2026-08-10',
        '2026-08-13',
        'Cool mountain getaway, cafe hopping, and art museum visits.',
        12000.00,
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
        'completed'
      ]
    );
    const compTripId = compTrip.rows[0].id;

    await query(
      `INSERT INTO expenses (trip_id, category, amount, expense_date, description, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [compTripId, 'transportation', 1800.00, '2026-08-10', 'Point-to-Point Bus Manila to Baguio', 'Genesis JoyBus Executive']
    );
    await query(
      `INSERT INTO expenses (trip_id, category, amount, expense_date, description, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [compTripId, 'food', 4200.00, '2026-08-12', 'Local Dining & Cafe Hopping', 'Hill Station and Arca’s Yard']
    );

    // Seed favorite destination
    await query(
      `INSERT INTO favorite_destinations (user_id, destination_id) VALUES ($1, $2)`,
      [demoUserId, 1]
    );

    console.log('✅ Default demo user and sample trip data seeded successfully');
  }
}

function getDbType() {
  return dbType;
}

module.exports = {
  initDb,
  query,
  getDbType,
};
