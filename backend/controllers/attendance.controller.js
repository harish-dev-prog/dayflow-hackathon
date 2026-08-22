const connectDB = require("../config/db");

// POST /api/attendance/check-in
async function checkIn(req, res) {
  try {
    const db = await connectDB();
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const existing = await db.get(
      "SELECT * FROM attendance WHERE user_id = ? AND attendance_date = ?",
      [userId, today]
    );

    if (existing && existing.check_in) {
      return res.status(400).json({ message: "Already checked in today." });
    }

    if (existing) {
      await db.run(
        "UPDATE attendance SET check_in = CURRENT_TIMESTAMP, status = 'Present', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [existing.id]
      );
    } else {
      await db.run(
        `INSERT INTO attendance (user_id, attendance_date, check_in, status)
         VALUES (?, ?, CURRENT_TIMESTAMP, 'Present')`,
        [userId, today]
      );
    }

    const attendance = await db.get(
      "SELECT * FROM attendance WHERE user_id = ? AND attendance_date = ?",
      [userId, today]
    );

    res.status(200).json({
      message: "Check-in successful.",
      attendance,
    });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
}

// POST /api/attendance/check-out
async function checkOut(req, res) {
  try {
    const db = await connectDB();
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const attendance = await db.get(
      "SELECT * FROM attendance WHERE user_id = ? AND attendance_date = ?",
      [userId, today]
    );

    if (!attendance || !attendance.check_in) {
      return res.status(400).json({ message: "Please check in first." });
    }

    if (attendance.check_out) {
      return res.status(400).json({ message: "Already checked out today." });
    }

    await db.run(
      "UPDATE attendance SET check_out = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [attendance.id]
    );

    const updated = await db.get(
      "SELECT * FROM attendance WHERE id = ?",
      [attendance.id]
    );

    res.status(200).json({
      message: "Check-out successful.",
      attendance: updated,
    });
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
}

// GET /api/attendance/me
async function getMyAttendance(req, res) {
  try {
    const db = await connectDB();

    const records = await db.all(
      `SELECT id, attendance_date, check_in, check_out, status
       FROM attendance
       WHERE user_id = ?
       ORDER BY attendance_date DESC`,
      [req.user.id]
    );

    res.status(200).json({ attendance: records });
  } catch (err) {
    console.error("Get attendance error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
}

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
};