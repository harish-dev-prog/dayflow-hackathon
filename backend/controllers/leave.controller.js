const connectDB = require("../config/db");

// Returns an array of YYYY-MM-DD strings from start to end (inclusive)
function dateRange(start, end) {
  const dates = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// POST /api/leave/apply
async function applyLeave(req, res) {
  try {
    const { leave_type, start_date, end_date, remarks } = req.body;
    const validTypes = ["paid", "sick", "unpaid"];

    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({ message: "leave_type, start_date, and end_date are required." });
    }
    if (!validTypes.includes(leave_type)) {
      return res.status(400).json({ message: `leave_type must be one of: ${validTypes.join(", ")}` });
    }
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: "start_date cannot be after end_date." });
    }

    const db = await connectDB();
    const result = await db.run(
      `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, remarks, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, leave_type, start_date, end_date, remarks || null]
    );

    return res.status(201).json({
      message: "Leave request submitted.",
      leave_request: {
        id: result.lastID,
        user_id: req.user.id,
        leave_type,
        start_date,
        end_date,
        remarks: remarks || null,
        status: "pending",
      },
    });
  } catch (err) {
    console.error("Apply leave error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// GET /api/leave/me
async function getMyLeaveRequests(req, res) {
  try {
    const db = await connectDB();
    const rows = await db.all(
      "SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    return res.status(200).json({ leave_requests: rows });
  } catch (err) {
    console.error("Get my leave requests error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// GET /api/leave/all?status=pending|approved|rejected (admin)
async function getAllLeaveRequests(req, res) {
  try {
    const db = await connectDB();
    const { status } = req.query;
    const validStatuses = ["pending", "approved", "rejected"];

    let rows;
    if (status && validStatuses.includes(status)) {
      rows = await db.all(
        `SELECT lr.*, u.name, u.employee_id
         FROM leave_requests lr JOIN users u ON u.id = lr.user_id
         WHERE lr.status = ? ORDER BY lr.created_at DESC`,
        [status]
      );
    } else {
      rows = await db.all(
        `SELECT lr.*, u.name, u.employee_id
         FROM leave_requests lr JOIN users u ON u.id = lr.user_id
         ORDER BY lr.created_at DESC`
      );
    }

    return res.status(200).json({ leave_requests: rows });
  } catch (err) {
    console.error("Get all leave requests error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// PATCH /api/leave/:id/approve (admin)
async function approveLeave(req, res) {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const { admin_comment } = req.body;

    const leave = await db.get("SELECT * FROM leave_requests WHERE id = ?", [id]);
    if (!leave) return res.status(404).json({ message: "Leave request not found." });
    if (leave.status !== "pending") {
      return res.status(409).json({ message: `This request is already ${leave.status}.` });
    }

    await db.run(
      "UPDATE leave_requests SET status = 'approved', admin_comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [admin_comment || null, id]
    );

    // Mark each day in the range as 'leave' in attendance so it reflects immediately
    const dates = dateRange(leave.start_date, leave.end_date);
    for (const date of dates) {
      const existing = await db.get(
        "SELECT id FROM attendance WHERE user_id = ? AND date = ?",
        [leave.user_id, date]
      );
      if (existing) {
        await db.run("UPDATE attendance SET status = 'leave' WHERE id = ?", [existing.id]);
      } else {
        await db.run(
          "INSERT INTO attendance (user_id, date, status) VALUES (?, ?, 'leave')",
          [leave.user_id, date]
        );
      }
    }

    return res.status(200).json({ message: "Leave request approved and attendance updated." });
  } catch (err) {
    console.error("Approve leave error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// PATCH /api/leave/:id/reject (admin)
async function rejectLeave(req, res) {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const { admin_comment } = req.body;

    const leave = await db.get("SELECT * FROM leave_requests WHERE id = ?", [id]);
    if (!leave) return res.status(404).json({ message: "Leave request not found." });
    if (leave.status !== "pending") {
      return res.status(409).json({ message: `This request is already ${leave.status}.` });
    }

    await db.run(
      "UPDATE leave_requests SET status = 'rejected', admin_comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [admin_comment || null, id]
    );

    return res.status(200).json({ message: "Leave request rejected." });
  } catch (err) {
    console.error("Reject leave error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

module.exports = {
  applyLeave,
  getMyLeaveRequests,
  getAllLeaveRequests,
  approveLeave,
  rejectLeave,
};
