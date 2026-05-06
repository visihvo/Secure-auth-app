const { z } = require("zod");

module.exports = z.object({
    username: z.string()
        .min(3)
        .max(40)
        .regex(/^[a-zA-Z0-9_]+$/),

    email: z.string().email(),

    password: z.string()
        .min(12)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/[0-9]/)
        .regex(/[^A-Za-z0-9]/)
});