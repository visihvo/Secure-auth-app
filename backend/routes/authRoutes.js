const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authLimiter = require("../middleware/rateLimit");

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/check-user", authController.checkUser);

module.exports = router;