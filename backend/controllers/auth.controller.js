const bcrypt = require("bcrypt");
const connectDB = require("../config/db");
const generateToken = require("../utils/generateToken");

const SALT_ROUNDS = 10;

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { employee_id, name, email, password, role } = req.body;

    if (!employee_id || !name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!["admin", "employee"].includes(role)) {
      return res.status(400).json({ message: "Role must be either 'admin' or 'employee'." });
    }

    // Password rule: min 8 chars, at least one letter and one number
    const passwordRule = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRule.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include a letter and a number.",
      });
    }

    const db = await connectDB();

    const existingUser = await db.get(
      "SELECT id FROM users WHERE email = ? OR employee_id = ?",
      [email, employee_id]
    );
    if (existingUser) {
      return res.status(409).json({ message: "User with this email or employee ID already exists." });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await db.run(
      `INSERT INTO users (employee_id, name, email, password_hash, role, is_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employee_id, name, email, password_hash, role, 0]
    );

    // Create an empty profile row so /profile/me works immediately after signup
    await db.run(`INSERT INTO profiles (user_id) VALUES (?)`, [result.lastID]);

    // NOTE: Real email verification (sending a link) is a stretch goal.
    // For the hackathon demo, is_verified defaults to 0 and can be
    // flipped via a simple "verify" endpoint or auto-verified below.

    return res.status(201).json({
      message: "Signup successful. Please verify your email before logging in.",
      user: {
        id: result.lastID,
        employee_id,
        name,
        email,
        role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Something went wrong during signup." });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const db = await connectDB();
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Something went wrong during login." });
  }
}

// GET /api/auth/me (protected - sanity check route)
async function getMe(req, res) {
  try {
    const db = await connectDB();
    const user = await db.get(
      "SELECT id, employee_id, name, email, role, is_verified FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ user });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

module.exports = { signup, login, getMe };
