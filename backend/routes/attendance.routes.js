const express = require("express");
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getAttendanceByUser,
  updateAttendanceStatus,
} = require("../controllers/attendance.controller");
const protect = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

// Self-service (employee and admin both have their own attendance)
router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);
router.get("/me", protect, getMyAttendance);

// Admin-only views and overrides
router.get("/all", protect, allowRoles("admin"), getAllAttendance);
router.get("/:userId", protect, allowRoles("admin"), getAttendanceByUser);
router.patch("/:userId/status", protect, allowRoles("admin"), updateAttendanceStatus);

module.exports = router;
