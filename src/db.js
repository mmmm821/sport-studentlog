const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Ensure the directory for the DB file exists
const dbDir = path.dirname(path.resolve(config.db.path));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.resolve(config.db.path));

// Performance & safety pragmas
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

// ── Schema ──
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    reg_number    TEXT    NOT NULL UNIQUE,
    email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name  TEXT    NOT NULL,
    roll_number   TEXT    NOT NULL,
    batch_year    TEXT    DEFAULT '',
    class         TEXT    NOT NULL,
    sport         TEXT    NOT NULL,
    category      TEXT    NOT NULL,
    achievement   TEXT    NOT NULL,
    position      TEXT    DEFAULT '',
    score         TEXT    DEFAULT '',
    event_name    TEXT    DEFAULT '',
    event_date    TEXT    DEFAULT '',
    level         TEXT    NOT NULL,
    description   TEXT    DEFAULT '',
    created_by    TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_ach_sport      ON achievements(sport);
  CREATE INDEX IF NOT EXISTS idx_ach_level      ON achievements(level);
  CREATE INDEX IF NOT EXISTS idx_ach_roll       ON achievements(roll_number);
  CREATE INDEX IF NOT EXISTS idx_ach_created_by ON achievements(created_by);
`);

module.exports = db;
