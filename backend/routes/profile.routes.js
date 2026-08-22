const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getProfileByAdmin,
  updateProfileByAdmin,
} = require("../controllers/profile.controller");
const protect = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

// Self-service (both roles, but each only ever touches their own row via req.user.id)
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

// Admin-only: view/edit any employee's profile
router.get("/:userId", protect, allowRoles("admin"), getProfileByAdmin);
router.put("/:userId", protect, allowRoles("admin"), updateProfileByAdmin);

module.exports = router;
