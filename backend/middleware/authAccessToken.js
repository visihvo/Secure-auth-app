const jwt = require("jsonwebtoken");
const { log } = require("../utils/logger");

/**
 * Middleware for validating JWT access tokens
 * 
 * Verifies that the incoming request contains
 * a valid Authorization header with a Bearer
 * token. If the token is valid, decoded user
 * information is attached to req.user and the
 * request continues to the next middleware.
 * 
 * Used to protect authenticated API routes.
 * 
 * Security:
 * - Prevents unauthorized access to protected endpoints
 * - Verifies token integrity using ACCESS_SECRET
 * - Rejects malformed, invalid or expired tokens
 * - Uses generic error responses not leak information
 * 
 * @param {Object} req Request object 
 * @param {Object} res Response object
 * @param {Object} next Next middleware function
 * @returns HTTP error response or next middleware
 */
function authenticateAccessToken(req, res, next) {
    // Debugging logs for authentication flow
    // only in development mode
    log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_SECRET);
    log("=== AUTH DEBUG START ===");
    log("Authorization header:", req.headers.authorization); 
    log("Cookies:", req.headers.cookie); 
    log("Session ID:", req.sessionID); 
    log("========================"); 

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        log("AUTH FAIL: Missing Authorization header");
        return res.status(401).json({ error: "Missing access token" });
    }

    const token = authHeader?.split(" ")[1];
    log("Extracted token:", token);

    if (!token) {
        log("AUTH FAIL: Malformed Authorization header");
        return res.status(401).json({ error: "Invalid token format" });
    }

    try {
        // Verifies token signature and expiration
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        
        log("AUTH SUCCESS:", decoded);
        
        // Stores decoded user payload into request object
        // { id, username }
        req.user = decoded;

        // Continues request execution
        next();
    } catch (err) {
        log("AUTH FAIL: Invalid token", err.message);
        return res.status(401).json({ error: "Invalid access token" });
    }
}

module.exports = authenticateAccessToken;