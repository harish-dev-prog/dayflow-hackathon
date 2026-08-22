const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getMyLeaveRequests,
  getAllLeaveRequests,
  approveLeave,
  rejectLeave,
} = require("../controllers/leave.controller");

const protect = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

// Employee
router.post("/apply", protect, applyLeave);
router.get("/me", protect, getMyLeaveRequests);

// Admin
router.get("/all", protect, allowRoles("admin"), getAllLeaveRequests);
router.patch("/:id/approve", protect, allowRoles("admin"), approveLeave);
router.patch("/:id/reject", protect, allowRoles("admin"), rejectLeave);

module.exports = router;
