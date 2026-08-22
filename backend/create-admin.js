const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

async function createAdmin() {
  const hash = await bcrypt.hash("Admin1234", 10);

  const db = new sqlite3.Database("dayflow.sqlite");

  db.run(
    `INSERT INTO users
    (employee_id, name, email, password_hash, role, is_verified)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      "ADMIN001",
      "DayFlow Admin",
      "admin@dayflow.com",
      hash,
      "admin",
      1
    ],
    function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log("ADMIN CREATED");
      }
      db.close();
    }
  );
}

createAdmin();