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
      attendance_date TEXT NOT NULL,
      check_in DATETIME,
      check_out DATETIME,
      status TEXT NOT NULL DEFAULT 'Present'
        CHECK(status IN ('Present', 'Absent', 'Late', 'Half-Day')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, attendance_date)
    );
  `);

  console.log("Connected to SQLite and ensured users + profiles tables exist");
  return dbInstance;
}

module.exports = connectDB;
