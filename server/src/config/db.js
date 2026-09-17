import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../../garage.db');

const verboseSqlite = sqlite3.verbose();
const db = new verboseSqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Promise-based helper functions for SQLite queries
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export async function initDb() {
  console.log('Initializing Database Tables & Seed Data...');

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'attendant',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS garages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      hourly_first_rate REAL DEFAULT 10.0,
      hourly_next_rate REAL DEFAULT 5.0,
      daily_cap_rate REAL DEFAULT 40.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS spot_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spot_type TEXT UNIQUE NOT NULL CHECK(spot_type IN ('compact', 'standard', 'ev')),
      hourly_first_rate REAL NOT NULL,
      hourly_next_rate REAL NOT NULL,
      daily_cap_rate REAL NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS floors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      garage_id INTEGER NOT NULL,
      floor_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (garage_id) REFERENCES garages(id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS spots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      floor_id INTEGER NOT NULL,
      spot_number TEXT NOT NULL,
      spot_type TEXT NOT NULL CHECK(spot_type IN ('compact', 'standard', 'ev')),
      is_occupied INTEGER DEFAULT 0,
      FOREIGN KEY (floor_id) REFERENCES floors(id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spot_id INTEGER NOT NULL,
      license_plate TEXT NOT NULL,
      vehicle_type TEXT NOT NULL CHECK(vehicle_type IN ('compact', 'standard', 'ev')),
      check_in_time DATETIME NOT NULL,
      check_out_time DATETIME,
      hours_billed INTEGER,
      total_fee REAL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (spot_id) REFERENCES spots(id)
    );
  `);

  // Seed default garage if none exists
  const existingGarage = await getOne(`SELECT * FROM garages LIMIT 1`);
  let garageId;
  if (!existingGarage) {
    const res = await run(
      `INSERT INTO garages (name, hourly_first_rate, hourly_next_rate, daily_cap_rate) 
       VALUES ('Metropolis City Garage', 10.0, 5.0, 40.0)`
    );
    garageId = res.id;
  // Seed default cleaned rates per spot type if empty
  const existingRates = await query(`SELECT * FROM spot_rates`);
  if (existingRates.length === 0) {
    await run(`INSERT INTO spot_rates (spot_type, hourly_first_rate, hourly_next_rate, daily_cap_rate) VALUES ('compact', 8.0, 4.0, 35.0)`);
    await run(`INSERT INTO spot_rates (spot_type, hourly_first_rate, hourly_next_rate, daily_cap_rate) VALUES ('standard', 10.0, 5.0, 40.0)`);
    await run(`INSERT INTO spot_rates (spot_type, hourly_first_rate, hourly_next_rate, daily_cap_rate) VALUES ('ev', 12.0, 6.0, 45.0)`);
    console.log('Seeded cleaned spot rates per spot type (Compact, Standard, EV)');
  }

  // Seed default demo user (Attendant)
  const existingUser = await getOne(`SELECT * FROM users WHERE email = 'attendant@garage.com'`);
  if (!existingUser) {
    const defaultPassword = await bcrypt.hash('password123', 10);
    await run(
      `INSERT INTO users (username, email, password_hash, role) VALUES ('Attendant Sam', 'attendant@garage.com', ?, 'attendant')`,
      [defaultPassword]
    );
    console.log('Seeded default attendant user: attendant@garage.com / password123');
  }

  // Seed floors & spots if empty
  const existingFloors = await query(`SELECT * FROM floors WHERE garage_id = ?`, [garageId]);
  if (existingFloors.length === 0) {
    const floorNames = ['Level 1 - Ground Floor', 'Level 2 - Lower Level', 'Level 3 - Upper Level'];
    for (let f = 0; f < floorNames.length; f++) {
      const floorRes = await run(
        `INSERT INTO floors (garage_id, floor_number, name) VALUES (?, ?, ?)`,
        [garageId, f + 1, floorNames[f]]
      );
      const floorId = floorRes.id;

      // Seed spots for each floor: 2 EV spots, 4 Compact spots, 6 Standard spots
      const spotConfigs = [
        { count: 2, type: 'ev', prefix: `L${f + 1}-EV` },
        { count: 4, type: 'compact', prefix: `L${f + 1}-C` },
        { count: 6, type: 'standard', prefix: `L${f + 1}-S` }
      ];

      for (const config of spotConfigs) {
        for (let i = 1; i <= config.count; i++) {
          const spotNum = `${config.prefix}${i < 10 ? '0' + i : i}`;
          await run(
            `INSERT INTO spots (floor_id, spot_number, spot_type, is_occupied) VALUES (?, ?, ?, 0)`,
            [floorId, spotNum, config.type]
          );
        }
      }
    }
    console.log('Seeded 3 Multi-level floors with 36 spots total (Compact, Standard, EV)');

    // Seed 3 sample active check-ins to make log and live map immediately rich
    const sampleEvSpot = await getOne(`SELECT * FROM spots WHERE spot_type = 'ev' LIMIT 1`);
    const sampleCompactSpot = await getOne(`SELECT * FROM spots WHERE spot_type = 'compact' LIMIT 1`);
    const sampleStandardSpot = await getOne(`SELECT * FROM spots WHERE spot_type = 'standard' LIMIT 1`);

    if (sampleEvSpot) {
      const checkIn1 = new Date(Date.now() - 45 * 60 * 1000).toISOString(); // 45 mins ago
      await run(`INSERT INTO tickets (spot_id, license_plate, vehicle_type, check_in_time, status) VALUES (?, 'TESLA-EV1', 'ev', ?, 'active')`, [sampleEvSpot.id, checkIn1]);
      await run(`UPDATE spots SET is_occupied = 1 WHERE id = ?`, [sampleEvSpot.id]);
    }
    if (sampleCompactSpot) {
      const checkIn2 = new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(); // 3.5 hours ago
      await run(`INSERT INTO tickets (spot_id, license_plate, vehicle_type, check_in_time, status) VALUES (?, 'MINI-789', 'compact', ?, 'active')`, [sampleCompactSpot.id, checkIn2]);
      await run(`UPDATE spots SET is_occupied = 1 WHERE id = ?`, [sampleCompactSpot.id]);
    }
    if (sampleStandardSpot) {
      const checkIn3 = new Date(Date.now() - 28 * 3600 * 1000).toISOString(); // 28 hours ago (multi-day cap test)
      await run(`INSERT INTO tickets (spot_id, license_plate, vehicle_type, check_in_time, status) VALUES (?, 'FORD-456', 'standard', ?, 'active')`, [sampleStandardSpot.id, checkIn3]);
      await run(`UPDATE spots SET is_occupied = 1 WHERE id = ?`, [sampleStandardSpot.id]);
    }
    console.log('Seeded initial active tickets');
  }

  console.log('Database initialization complete.');
}

export default db;
