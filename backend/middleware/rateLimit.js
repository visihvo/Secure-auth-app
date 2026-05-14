const rateLimit = require("express-rate-limit");

/**
 * Authentication rate limiting middleware
 * 
 * This middleware limits repeated authentication
 * attempts (eg. login and registration endpoints)
 * to reduce abuse.
 * 
 * Security purpose:
 * - Mitigates bruteforce attacks
 * - Reduces credential snooping attempts by checking
 *   potential used credentials (also handled safely)
 * - Prevents automated password inserting with
 *   stolen leaked credits etc.
 * 
 * Configuration: 
 * - Time window: 15 minutes
 * - Max requests: 10 per IP within the time window
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10,
    message: {
        success: false,
        error: "Too many requests, try again later"
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = authLimiter;