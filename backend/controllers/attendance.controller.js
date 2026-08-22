const connectDB = require("../config/db");

// Helper: today's date as YYYY-MM-DD
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// Helper: N days ago
function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// POST /api/attendance/check-in
async function checkIn(req, res) {
  try {
    const db = await connectDB();
    const date = todayStr();

    const existing = await db.get(
      "SELECT * FROM attendance WHERE user_id = ? AND date = ?",
      [req.user.id, date]
    );

    if (existing) {
      return res.status(409).json({
        message: "You have already checked in today.",
        attendance: existing,
      });
    }

    const now = new Date().toISOString();

    const result = await db.run(
      `INSERT INTO attendance
       (user_id, date, check_in, status)
       VALUES (?, ?, ?, 'present')`,
      [req.user.id, date, now]
    );

    return res.status(201).json({
      message: "Checked in successfully.",
      attendance: {
        id: result.lastID,
        user_id: req.user.id,
        date: date,
        check_in: now,
        check_out: null,
        status: "present",
      },
    });
  } catch (err) {
    console.error("Check-in error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// POST /api/attendance/check-out
async function checkOut(req, res) {
  try {
    const db = await connectDB();
    const date = todayStr();

    const existing = await db.get(
      "SELECT * FROM attendance WHERE user_id = ? AND date = ?",
      [req.user.id, date]
    );

    if (!existing) {
      return res.status(400).json({
        message: "You haven't checked in today yet.",
      });
    }

    if (existing.check_out) {
      return res.status(409).json({
        message: "You have already checked out today.",
      });
    }

    const now = new Date().toISOString();

    const hoursWorked =
      (new Date(now) - new Date(existing.check_in)) /
      (1000 * 60 * 60);

    const status = hoursWorked < 4 ? "half-day" : "present";

    await db.run(
      "UPDATE attendance SET check_out = ?, status = ? WHERE id = ?",
      [now, status, existing.id]
    );

    return res.status(200).json({
      message: "Checked out successfully.",
      attendance: {
        ...existing,
        check_out: now,
        status,
      },
    });
  } catch (err) {
    console.error("Check-out error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// GET /api/attendance/me?range=daily|weekly
async function getMyAttendance(req, res) {
  try {
    const db = await connectDB();
    const range = req.query.range === "weekly" ? "weekly" : "daily";

    let rows;

    if (range === "daily") {
      rows = await db.all(
        "SELECT * FROM attendance WHERE user_id = ? AND date = ?",
        [req.user.id, todayStr()]
      );
    } else {
      rows = await db.all(
        "SELECT * FROM attendance WHERE user_id = ? AND date >= ? ORDER BY date DESC",
        [req.user.id, daysAgoStr(7)]
      );
    }

    return res.status(200).json({
      range,
      attendance: rows,
    });
  } catch (err) {
    console.error("Get my attendance error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// GET /api/attendance/all?date=YYYY-MM-DD
async function getAllAttendance(req, res) {
  try {
    const db = await connectDB();
    const date = req.query.date || todayStr();

    const rows = await db.all(
      `SELECT a.*, u.name, u.employee_id
       FROM attendance a
       JOIN users u ON u.id = a.user_id
       WHERE a.date = ?
       ORDER BY u.name ASC`,
      [date]
    );

    return res.status(200).json({
      date,
      attendance: rows,
    });
  } catch (err) {
    console.error("Get all attendance error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// GET /api/attendance/:userId?range=daily|weekly
async function getAttendanceByUser(req, res) {
  try {
    const db = await connectDB();
    const range = req.query.range === "weekly" ? "weekly" : "daily";
    const userId = req.params.userId;

    let rows;

    if (range === "daily") {
      rows = await db.all(
        "SELECT * FROM attendance WHERE user_id = ? AND date = ?",
        [userId, todayStr()]
      );
    } else {
      rows = await db.all(
        "SELECT * FROM attendance WHERE user_id = ? AND date >= ? ORDER BY date DESC",
        [userId, daysAgoStr(7)]
      );
    }

    return res.status(200).json({
      range,
      attendance: rows,
    });
  } catch (err) {
    console.error("Get attendance by user error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// PATCH /api/attendance/:userId/status
async function updateAttendanceStatus(req, res) {
  try {
    const { date, status } = req.body;

    const validStatuses = [
      "present",
      "absent",
      "half-day",
      "leave",
    ];

    if (!date || !status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `date and a valid status (${validStatuses.join(
          ", "
        )}) are required.`,
      });
    }

    const db = await connectDB();
    const userId = req.params.userId;

    const existing = await db.get(
      "SELECT * FROM attendance WHERE user_id = ? AND date = ?",
      [userId, date]
    );

    if (existing) {
      await db.run(
        "UPDATE attendance SET status = ? WHERE id = ?",
        [status, existing.id]
      );
    } else {
      await db.run(
        "INSERT INTO attendance (user_id, date, status) VALUES (?, ?, ?)",
        [userId, date, status]
      );
    }

    return res.status(200).json({
      message: "Attendance status updated.",
    });
  } catch (err) {
    console.error("Update attendance status error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getAttendanceByUser,
  updateAttendanceStatus,
};