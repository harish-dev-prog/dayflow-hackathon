const express = require("express");
const router = express.Router();
const { getMyPayroll, getAllPayroll, updatePayroll } = require("../controllers/payroll.controller");
const protect = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

// Employee - read-only
router.get("/me", protect, getMyPayroll);

// Admin
router.get("/all", protect, allowRoles("admin"), getAllPayroll);
router.put("/:userId", protect, allowRoles("admin"), updatePayroll);

module.exports = router;
