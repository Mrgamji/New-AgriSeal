// backend/src/utils/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../database.sqlite');

console.log(`[db.js] Using database path: ${DB_PATH}`);

const db = await open({
  filename: DB_PATH,
  driver: sqlite3.Database
});

// Enable foreign key constraints
await db.run('PRAGMA foreign_keys = ON;');

// Create tables if they do not exist
await db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  credits INTEGER DEFAULT 1,
  auth_provider TEXT DEFAULT 'email',
  firebase_uid TEXT,
  profile_picture TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS detections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category TEXT,
  crop_type TEXT,
  description TEXT,
  status TEXT,
  confidence REAL,
  disease_type TEXT,
  severity INTEGER,
  ai_source TEXT,
  analysis_time INTEGER,
  image_paths TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  detection_id INTEGER NOT NULL,
  recommendation TEXT,
  FOREIGN KEY(detection_id) REFERENCES detections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS processing_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  detection_id INTEGER NOT NULL,
  step_name TEXT,
  completed INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  FOREIGN KEY(detection_id) REFERENCES detections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS detection_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  detection_id INTEGER NOT NULL,
  details TEXT,
  FOREIGN KEY(detection_id) REFERENCES detections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount INTEGER,
  type TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_ref TEXT UNIQUE,
  paystack_reference TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

console.log('[db.js] Database initialized with all tables.');

export default db;
