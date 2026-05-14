const crypto = require("crypto");

/**
 * Generates a secure CSRF token with crypto. The
 * token is 32-bytes and in string hex format.
 * 
 * Security:
 * - Uses Node.js crpytoRandomBytes <-- maintained
 * - Unpredictable CSRF token
 * - Resistant to guessing or automated attacks/misusage
 * @returns 32-bytes hex-encoded CSRF token
 */
function generateCsrfToken() {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Creates and stores a CSRF token in the user's
 * session.
 * 
 * Security:
 * - Token is bound to the server-side session
 * - Used to validate state-changing request(s)
 * - Prevents CSRF attacks
 * @param {Object} req Request object with session data
 * @returns Generated 32-bytes hex-encoded CSRF token
 */
function setCsrfToken(req) {
    const token = generateCsrfToken();
    //Store token in session for later validation
    req.session.csrfToken = token;
    return token;
}

/**
 * Validates CSRF token from request against session-
 * stored token.
 * 
 * Validation:
 * - Request must include "x-csrf-token" header
 * - Session must contain a CSRF token
 * - These two values have to match perfectly
 * 
 * Security:
 * - Ensures request originates from trusted client
 * - Prevents unauthorized cross-site state changing
 *   requests
 * @param {Object} req Request object
 * @returns {boolean} True if CSRF token is valid, otherwise false
 */
function validateCsrf(req) {
    const sent = req.headers["x-csrf-token"];
    const stored = req.session.csrfToken;
    return sent && stored && sent === stored;
}

module.exports = { setCsrfToken, validateCsrf };