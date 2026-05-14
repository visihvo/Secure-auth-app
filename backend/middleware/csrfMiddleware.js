const { log } = require("../utils/logger");

/**
 * CSRF Protection middleware
 * 
 * This middleware validates that incoming state-
 * changing requests contain a valid CSRF token
 * that matches the token generated and stored in
 * the user's server-side session.
 * 
 * Security:
 * - CSRF token is stored in server session (req.session.csrfToken)
 * - Client must send matching token via "x-csrf-token" header
 * - Request is rejected if tokens are missing or mismatched
 * - Protects against CSRF attacks, unauthorized state changing
 *   requests from external origins
 * @param {Object} req - Request object (must include session)
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 * @returns Void or Response
 */
function csrfMiddleware(req, res, next) {
    log("=== CSRF MIDDLEWARE HIT ===");
    log("Header token:", req.headers["x-csrf-token"]);
    log("Session token:", req.session.csrfToken);
    log("Session ID:", req.sessionID);
    log("Cookies:", req.headers.cookie);

    const header = req.headers["x-csrf-token"];
    const sessionToken = req.session?.csrfToken;

    // Reject request if CSRF header is missing
    if (!header) {
        log("CSRF FAIL: Missing header");
        return res.status(403).json({ error: "Missing CSRF header" });
    }

    // Reject request is session doesn't contain CSRF token
    if (!sessionToken) {
        log("CSRF FAIL: Missing session token");
        return res.status(403).json({ error: "Missing CSRF session token" });
    }

    // Check token matching
    if (header !== sessionToken) {
        log("CSRF FAIL: Token mismatch");
        return res.status(403).json({ error: "Invalid CSRF token" });
    }

    next();
}

module.exports = csrfMiddleware;