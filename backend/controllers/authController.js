const authService = require("../services/authService");
const { log } = require("../utils/logger");

/**
 * Handles user registration requests
 *
 * Security features:
 * - Uses backend validation through service layer
 * - Returns generic error messages
 * - Prevents sensitive information leakage
 *
 * @param {Object} req Request object containing registration form data
 * @param {Object} res Response object
 * @returns JSON response containing registration result
 */
exports.register = async (req, res) => {
    try {

        // Forward validated request body to authentication service
        const result = await authService.register(req.body);

        return res.json({
            success: true,
            data: result
        });

    } catch (err) {
        return res.status(400).json({
            success: false,
            error: "Registration failed"
        });
    }
};

/**
 * Handles user login requests
 * 
 * Security features:
 * - Generic authentication errors
 * - Secure refresh token cookie
 * - HTTP-only cookie protection
 * - Secure cookie usage in production
 * 
 * @param {Object} req Request object containing login credentials
 * @param {Object} res Response object
 * @returns JSON response containing registration results
 */
exports.login = async (req, res) => {
    try {

        // Authenticate user via service layer
        const result = await authService.login(req.body);

        // Store refresh token as HTTP-only cookie
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return res.json({
            success: true,
            data: {
                accessToken: result.accessToken,
                username: result.username
            }
        });

    } catch (err) {

        return res.status(400).json({
            success: false,
            error: "Invalid credentials"
        });
    }
};

/**
 * Handles user logout requests
 *
 * Security features:
 * - Session invalidation
 * - Refresh token removal
 * - Cookie clearing
 * - Server-side session destruction
 *
 * @param {Object} req - Express request object containing cookies,
 *                       session object and session storage instance
 * @param {Object} res - Response object
 * @returns JSON response confirming logout
 */
exports.logout = async (req, res) => {
    try {

        log("=== LOGOUT CONTROLLER HIT ===");
        log("User:", req.user);
        log("Session ID:", req.sessionID);

        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(204).end();
        }

        log("COOKIE:", req.cookies);

        // Remove refresh token cookie from browser
        res.clearCookie("refreshToken", {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        // Destroy server-side session from Redis session storage
        req.sessionStore.destroy(req.sessionID, (err) => {

            if (err) {

                log("Session destroy error:", err);

                return res.status(500).json({
                    error: "Failed to destroy session"
                });
            }

            // Remove session ID cookie
            res.clearCookie("sid");

            return res.json({
                success: true,
                data: {
                    message: "Logged out"
                }
            });
        });

    } catch (err) {

        log("Logout error:", err);

        return res.status(500).json({
            success: false,
            error: "Logout failed"
        });
    }
};

/**
 * Handles access token refresh requests
 *
 * Security features:
 * - Refresh token validation
 * - Short-lived access token renewal
 * - Rejects invalid or expired tokens
 *
 * @param {Object} req - Request object containing refresh token
 * @param {Object} res - Response object
 * @returns JSON response containing new access token
 */
exports.refresh = async (req, res) => {
    try {

        // Extract refresh token from secure cookie
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "No token"
            });
        }

        // Generate new access token via service layer
        const accessToken = await authService.refresh(token);

        return res.json({
            success: true,
            data: {
                accessToken
            }
        });

    } catch (err) {

        // Invalid or expired refresh token
        return res.status(403).json({
            success: false,
            error: "Invalid token or expired refresh token"
        });
    }
};

/**
 * Checks whether username or email already exists
 * Used for frontend registration validation
 *
 * Security features:
 * - Uses service layer validation
 * - Generic failure responses
 * - Safe query parameter handling
 *
 * @param {Object} req - Request object containing username and email
 * @param {Object} res - Response object
 * @returns JSON response containing availability status
 */
exports.checkUser = async (req, res) => {
    try {

        // Forward request query safely to service layer
        const result = await authService.checkUser(req.query);

        return res.json({
            success: true,
            data: result
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            error: "Request failed"
        });
    }
};