const connectDB = require("../config/db");

// GET /api/payroll/me - employee read-only view of their own salary
async function getMyPayroll(req, res) {
  try {
    const db = await connectDB();
    const payroll = await db.get(
      `SELECT basic_salary, allowances, deductions,
              (basic_salary + allowances - deductions) AS net_salary
       FROM profiles WHERE user_id = ?`,
      [req.user.id]
    );

    if (!payroll) return res.status(404).json({ message: "Payroll record not found." });
    return res.status(200).json({ payroll });
  } catch (err) {
    console.error("Get my payroll error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// GET /api/payroll/all - admin view of everyone's payroll
async function getAllPayroll(req, res) {
  try {
    const db = await connectDB();
    const rows = await db.all(
      `SELECT u.id AS user_id, u.employee_id, u.name,
              p.basic_salary, p.allowances, p.deductions,
              (p.basic_salary + p.allowances - p.deductions) AS net_salary
       FROM users u JOIN profiles p ON p.user_id = u.id
       ORDER BY u.name ASC`
    );
    return res.status(200).json({ payroll: rows });
  } catch (err) {
    console.error("Get all payroll error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// PUT /api/payroll/:userId - admin updates salary structure for one employee
async function updatePayroll(req, res) {
  try {
    const { basic_salary, allowances, deductions } = req.body;

    if (basic_salary === undefined && allowances === undefined && deductions === undefined) {
      return res.status(400).json({
        message: "Provide at least one of basic_salary, allowances, deductions.",
      });
    }

    const db = await connectDB();
    const existing = await db.get("SELECT user_id FROM profiles WHERE user_id = ?", [req.params.userId]);
    if (!existing) return res.status(404).json({ message: "Employee not found." });

    const setClauses = [];
    const values = [];
    if (basic_salary !== undefined) { setClauses.push("basic_salary = ?"); values.push(basic_salary); }
    if (allowances !== undefined) { setClauses.push("allowances = ?"); values.push(allowances); }
    if (deductions !== undefined) { setClauses.push("deductions = ?"); values.push(deductions); }
    values.push(req.params.userId);

    await db.run(
      `UPDATE profiles SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      values
    );

    return res.status(200).json({ message: "Payroll updated successfully." });
  } catch (err) {
    console.error("Update payroll error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

module.exports = { getMyPayroll, getAllPayroll, updatePayroll };
