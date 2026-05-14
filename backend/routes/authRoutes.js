const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authLimiter = require("../middleware/rateLimit");
const csrfMiddleware = require("../middleware/csrfMiddleware");
const authenticateAccessToken = require("../middleware/authAccessToken");

const isDev = process.env.NODE_ENV === ("development");

if (isDev) {
    console.log("authRoutes loaded");
    console.log("csrfMiddleware type:", typeof csrfMiddleware);
    console.log("logout handler type:", typeof authController.logout);
}

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.get("/check-user", authController.checkUser);

router.post("/logout", (req, res, next) => {
    console.log("=== ROUTER LOGOUT HIT ===");
    next();
}, authenticateAccessToken, csrfMiddleware, authController.logout);

module.exports = router;