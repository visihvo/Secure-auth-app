const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authLimiter = require("../middleware/rateLimit");
const csrfMiddleware = require("../middleware/csrfMiddleware");
const authenticateAccessToken = require("../middleware/authAccessToken");

/**
 * Authentication routes
 * 
 * This module defines all authentication-related
 * API endpoints including:
 * - User registration
 * - Login
 * - Token refresh
 * - User existence checks
 * - Logout
 * 
 * Security:
 * - Rate limiting applied to register and login
 * - JWT access token authentication
 * - CSRF protection for state-changing operation(s)
 * - Separation of public vs protected endpoints
 */
// Public: User registration and login
// Protected against abuse using rate limiting
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
// Public: Refresh access token using refresh token cookie
router.post("/refresh", authController.refresh);
// Public: Check if username or email already exists
// Used for frontend validation during registration
router.get("/check-user", authController.checkUser);

/**
 * Protected: Logout endpoint
 * 
 * Security:
 * 1. JWT access token verification (authenticateAccessToken)
 * 2. CSRF token validation (csrfMiddleware)
 * 3. Session and refresh token invalidation (authController.logout)
 * - Only authenticated users can logout
 * - Logout requests cannot be done cross-site
 * - Tokens and sessions are properly invalidated
 */
router.post("/logout", (req, res, next) => {
    next();
}, authenticateAccessToken, csrfMiddleware, authController.logout);

module.exports = router;