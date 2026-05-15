const { z } = require("zod");

/**
 * Registration data validation schema
 * 
 * Security features:
 * - Enforces strict input validation
 * - Prevents malformed or dangerous input
 * - Ensures password complexity requirements
 * - Reduces risk of injection and insecure credentials
 * - Provides clear error messages
 * 
 * Validation rules are the same than on frontend,
 * except the email requires atleast 2 chars long
 * top-level domain (.co)!
 */
module.exports = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(40, "Username must be at most 40 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores allowed"),

    email: z.string().email("Invalid email format"),

    password: z.string()
        .min(12, "Password must be at least 12 characters")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[a-z]/, "Must contain a lowercase letter")
        .regex(/[0-9]/, "Must contain a number")
        .regex(/[^A-Za-z0-9]/, "Must contain a special character")
});