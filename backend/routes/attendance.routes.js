const express = require("express");
const {
  checkIn,
  checkOut,
  getMyAttendance,
} = require("../controllers/attendance.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/check-in", authMiddleware, checkIn);
router.post("/check-out", authMiddleware, checkOut);
router.get("/me", authMiddleware, getMyAttendance);

module.exports = router;