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

  console.log("Connected to SQLite and ensured users table exists");
  return dbInstance;
}

module.exports = connectDB;
