const express = require("express");
const router = express.Router();

/**
 * User profile endpoint
 * 
 * This endpoints returns basic information about
 * the authenticated user. Currently id and username.
 * 
 * Security:
 * - Requires validated authentication middleware
 *   ^^ done in server.js
 */
router.get("/profile", (req, res) => {
    res.json({
        userId: req.user.id,
        username: req.user.username
    });
});

module.exports = router;