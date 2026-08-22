const connectDB = require("../config/db");

// Fields an EMPLOYEE is allowed to edit on their own profile
const EMPLOYEE_EDITABLE_FIELDS = ["phone", "address", "profile_picture"];

// Fields an ADMIN can edit on any employee's profile
const ADMIN_EDITABLE_FIELDS = [
  "phone",
  "address",
  "profile_picture",
  "department",
  "designation",
  "date_of_joining",
  "basic_salary",
  "allowances",
  "deductions",
  "documents",
];

function buildUpdateQuery(fields, body) {
  const setClauses = [];
  const values = [];

  for (const field of fields) {
    if (body[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(body[field]);
    }
  }

  return { setClauses, values };
}

// GET /api/profile/me - logged-in user views their own full profile
async function getMyProfile(req, res) {
  try {
    const db = await connectDB();
    const profile = await db.get(
      `SELECT u.id, u.employee_id, u.name, u.email, u.role,
              p.phone, p.address, p.profile_picture,
              p.department, p.designation, p.date_of_joining,
              p.basic_salary, p.allowances, p.deductions, p.documents
       FROM users u
       JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!profile) return res.status(404).json({ message: "Profile not found." });
    return res.status(200).json({ profile });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// PUT /api/profile/me - employee edits their own limited fields
async function updateMyProfile(req, res) {
  try {
    const { setClauses, values } = buildUpdateQuery(EMPLOYEE_EDITABLE_FIELDS, req.body);

    if (setClauses.length === 0) {
      return res.status(400).json({
        message: `No valid fields to update. Editable fields: ${EMPLOYEE_EDITABLE_FIELDS.join(", ")}`,
      });
    }

    const db = await connectDB();
    values.push(req.user.id);

    await db.run(
      `UPDATE profiles SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      values
    );

    return res.status(200).json({ message: "Profile updated successfully." });
  } catch (err) {
    console.error("Update own profile error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// GET /api/profile/:userId - admin views any employee's full profile
async function getProfileByAdmin(req, res) {
  try {
    const db = await connectDB();
    const profile = await db.get(
      `SELECT u.id, u.employee_id, u.name, u.email, u.role,
              p.phone, p.address, p.profile_picture,
              p.department, p.designation, p.date_of_joining,
              p.basic_salary, p.allowances, p.deductions, p.documents
       FROM users u
       JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.params.userId]
    );

    if (!profile) return res.status(404).json({ message: "Employee not found." });
    return res.status(200).json({ profile });
  } catch (err) {
    console.error("Admin get profile error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

// PUT /api/profile/:userId - admin edits any field on any employee
async function updateProfileByAdmin(req, res) {
  try {
    const { setClauses, values } = buildUpdateQuery(ADMIN_EDITABLE_FIELDS, req.body);

    if (setClauses.length === 0) {
      return res.status(400).json({
        message: `No valid fields to update. Editable fields: ${ADMIN_EDITABLE_FIELDS.join(", ")}`,
      });
    }

    const db = await connectDB();

    const existing = await db.get("SELECT user_id FROM profiles WHERE user_id = ?", [req.params.userId]);
    if (!existing) return res.status(404).json({ message: "Employee not found." });

    values.push(req.params.userId);

    await db.run(
      `UPDATE profiles SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      values
    );

    return res.status(200).json({ message: "Employee profile updated successfully." });
  } catch (err) {
    console.error("Admin update profile error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

module.exports = { getMyProfile, updateMyProfile, getProfileByAdmin, updateProfileByAdmin };
