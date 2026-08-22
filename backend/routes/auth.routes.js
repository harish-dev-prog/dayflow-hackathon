const express = require("express");
const router = express.Router();
const { signup, login, getMe, verifyEmail } = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
 
router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/verify/:token", verifyEmail);
 
module.exports = router;
 
