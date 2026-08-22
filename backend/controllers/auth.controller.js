const bcrypt = require("bcrypt");
const crypto = require("crypto");
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
    const verification_token = crypto.randomBytes(20).toString("hex");
 
    const result = await db.run(
      `INSERT INTO users (employee_id, name, email, password_hash, role, is_verified, verification_token)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, name, email, password_hash, role, 0, verification_token]
    );
 
    // Create an empty profile row so /profile/me works immediately after signup
    await db.run(`INSERT INTO profiles (user_id) VALUES (?)`, [result.lastID]);
 
    // NOTE: No SMTP/mail server is configured for this hackathon build, so we
    // don't actually dispatch an email. The verification link is returned in
    // the API response instead (frontend surfaces it as a "Verify Email" step
    // right after signup) so the same real token + endpoint flow used by a
    // production email link can be demoed end-to-end.
 
    return res.status(201).json({
      message: "Signup successful. Please verify your email before logging in.",
      verification_token,
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
 
// GET /api/auth/verify/:token - confirms a user's email using their verification token
async function verifyEmail(req, res) {
  try {
    const { token } = req.params;
 
    if (!token) {
      return res.status(400).json({ message: "Verification token is required." });
    }
 
    const db = await connectDB();
    const user = await db.get(
      "SELECT id, is_verified FROM users WHERE verification_token = ?",
      [token]
    );
 
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }
 
    if (user.is_verified) {
      return res.status(200).json({ message: "Email already verified. You can log in." });
    }
 
    await db.run(
      "UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?",
      [user.id]
    );
 
    return res.status(200).json({ message: "Email verified successfully. You can log in now." });
  } catch (err) {
    console.error("Verify email error:", err);
    return res.status(500).json({ message: "Something went wrong during verification." });
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
 
    // Legacy/seeded users may have is_verified stored as null instead of 0/1
    // (older schema before verification existed). Treat null the same as
    // verified so existing test accounts are never locked out by this change.
    const isVerified = user.is_verified === null || user.is_verified === undefined
      ? true
      : Boolean(user.is_verified);
 
    if (!isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
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
 
module.exports = { signup, login, getMe, verifyEmail };
 