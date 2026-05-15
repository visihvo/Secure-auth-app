require("dotenv").config();
require("./database");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const { createClient } = require("redis");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const csrfRoutes = require("./routes/csrf");

const authenticateAccessToken = require("./middleware/authAccessToken");
const { log } = require("./utils/logger");

const app = express();

// Server port
const PORT = process.env.PORT;

// Used for testing
const isTest = process.env.NODE_ENV === "test";
const isDev = process.env.NODE_ENV === "development";

// Used to sign session cookies
const SESSION_SECRET =
    process.env.SESSION_SECRET ||
    (isTest ? "test-secret" : null);

if (!SESSION_SECRET) {
    throw new Error("Server - SESSION_SECRET is required");
}

// Allowed frontend origins, used to restrict
// CORS access by preventing unauthorized origins
const allowedOrigins = [
    process.env.CLIENT_URL, // Vite dev
    process.env.DOCKER_CLIENT_URL // Docker
];

/**
 * Redis client confinguration
 * 
 * - Centralized server side session storage
 * - Prevents insecure in-memory session storage
 */
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

// Redis client runtime error handling
redisClient.on("error", (err) => {
    log("Redis error:", err);
});

// Apply helmet security headers
app.use(helmet());

/**
 * Configure CORS
 * 
 * Security:
 * - Allows only trusted origins
 * - Enables credentialed requests securely
 * - Restricts allowed request methods and headers
 * - Error handling
 */
app.use(cors({ 
    origin: function (origin, callback) {
        // Same site origin is seen as undefined
        if (!origin ) {
            return callback(null, true);
        }

        // Browswer cross-origin requests have origin
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "x-csrf-token", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
}));

// Parse coming JSON req bodies
app.use(express.json());

// Cookies from incoming reqs
app.use(cookieParser());

/**
 * Creates secure session middleware configuration
 * 
 * Security:
 * - HTTP-only session cookie
 * - Secure cookies in production
 * - sameSite property
 * - Redis backed persistent sessions
 * @returns 
 */
function createSession() {
    return session({
        store: isTest
            ? undefined
            : new RedisStore({
                client: redisClient,
                prefix: "sess:"
            }),
        name: "sid",
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    });
}

// Enable session handling middleware
app.use(createSession());

// Development debugging logs
if (isDev) {
    app.use((req, res, next) => {
        log("method:", req.method);
        log("path:", req.path);
        log("csrf header:", req.headers["x-csrf-token"]);
        log("cookies:", req.headers.cookie);
        next();
    });
}

// CSRF token endpoints (handled in routes/csrf.js)
app.use("/api", csrfRoutes);

// Public authentication routes
// no access token required (login, register, ...)
app.use("/api/auth", authRoutes);

// Protected user routes
// requires valid access token eg. /api/user/profile
app.use("/api/user", authenticateAccessToken, userRoutes);

// Error handling
app.use((err, req, res, next) => {
    log(err);
    res.status(500).json({ error: "Server error" });
})

async function startServer() {
    try {
        // Don't connect Redis in testing
        if (!isTest) {
            await redisClient.connect();
        }

        return app.listen(PORT, () => {
            log(`Server running!`);
        });
    } catch (error) {
        log("Failed to start server:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = {app, startServer, redisClient};