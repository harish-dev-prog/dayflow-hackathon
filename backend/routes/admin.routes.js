const express = require("express");
const router = express.Router();
const connectDB = require("../config/db");
const protect = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

// GET /api/admin/employees - Admin only: list all employees
router.get("/employees", protect, allowRoles("admin"), async (req, res) => {
  try {
    const db = await connectDB();
    const employees = await db.all(
      "SELECT id, employee_id, name, email, role, is_verified, created_at FROM users"
    );
    return res.status(200).json({ employees });
  } catch (err) {
    console.error("List employees error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
});

module.exports = router;
