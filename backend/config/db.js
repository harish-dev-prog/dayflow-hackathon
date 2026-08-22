const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
require("dotenv").config();

let dbInstance = null;

async function connectDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: process.env.DB_PATH || "./dayflow.sqlite",
    driver: sqlite3.Database,
  });

  // Foreign keys must be turned on explicitly in SQLite
  await dbInstance.exec("PRAGMA foreign_keys = ON;");

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'employee')) DEFAULT 'employee',
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,

      -- Personal details (employee can edit)
      phone TEXT,
      address TEXT,
      profile_picture TEXT,

      -- Job details (admin only)
      department TEXT,
      designation TEXT,
      date_of_joining TEXT,

      -- Salary structure (admin only, employee views read-only via /me)
      basic_salary REAL DEFAULT 0,
      allowances REAL DEFAULT 0,
      deductions REAL DEFAULT 0,

      -- Documents (admin only) - comma-separated file names/URLs for hackathon scope
      documents TEXT,

      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,               -- 'YYYY-MM-DD', one row per user per day
      check_in TEXT,                    -- ISO timestamp
      check_out TEXT,                   -- ISO timestamp
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'half-day', 'leave')) DEFAULT 'present',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );
  `);

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      leave_type TEXT NOT NULL CHECK(leave_type IN ('paid', 'sick', 'unpaid')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      remarks TEXT,
      status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      admin_comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log("Connected to SQLite and ensured users + profiles + attendance + leave_requests tables exist");
  return dbInstance;
}

module.exports = connectDB;
