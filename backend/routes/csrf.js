const express = require("express");
const router = express.Router();

const { setCsrfToken } = require("../utils/csrf");

/**
 * CSRF token endpoint
 * 
 * This endpoint generates and returns a CSRF token
 * for the client. The token is stored in the server-
 * side session and must be included in requests
 * protected by CSRF middleware. These are state-
 * changing requests eg. POST, PUT, DELETE.
 * 
 * Security:
 * - Creates CSRF protection for the user session
 * - Prevents CSRF attacks
 * - CSRF token is cryptographically secure
 * - Returned to client for use in req headers
 */
router.get("/csrf-token", (req, res) => {
    const token = setCsrfToken(req);
    res.json({ csrfToken: token });
});

module.exports = router;