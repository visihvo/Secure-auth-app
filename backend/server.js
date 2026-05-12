require("dotenv").config();
require("./database");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const session = require("express-session");
const { RedisStore } = require("connect-redis");
const { createClient } = require("redis");;

const crypto = require("crypto");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const authenticateAccessToken = require("./middleware/authAccessToken");
const csrfMiddleware = require("./middleware/csrfMiddleware");

const app = express();
const PORT = 5000; // Hide this?

// Used for testing
const isTest = process.env.NODE_ENV === "test";
// Used for debugging logs etc.
const isDev = process.env.NODE_ENV === ("development");

if (isTest && !process.env.SESSION_SECRET) {
    throw new Error("Server - SESSION_SECRET is required");
}

const allowedOrigins = [
    process.env.CLIENT_URL, // Vite dev
    process.env.DOCKER_CLIENT_URL // Docker
];

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});

// await redisClient.connect();

app.use(helmet());

app.use(cors({ 
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "x-csrf-token", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
}));

app.use(express.json());

app.use(cookieParser());

function createSession() {
    return session({
        store: isTest
            ? undefined
            : new RedisStore({
                client: redisClient,
                prefix: "sess:"
            }),
        name: "sid",
        secret: isTest
            ? "test-secret"
            : process.env.SESSION_SECRET,
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

app.use(createSession());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

if (isDev) {
    app.use((req, res, next) => {
        console.log("method:", req.method);
        console.log("path:", req.path);
        console.log("csrf header:", req.headers["x-csrf-token"]);
        console.log("cookies:", req.headers.cookie);
        next();
    });
}

// CSRF Token
app.get("/api/csrf-token", (req, res) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = require("crypto").randomBytes(32).toString("hex");
    }
    res.json({ csrfToken: req.session.csrfToken });
});

app.get("/health", (req, res) => res.send("ok"));

// Public routes - no csrf
// login, register, refresh, check-user
app.use("/api/auth", authRoutes);

// Protected user routes - requires access token 
// eg. /api/user/profile
app.use("/api/user", authenticateAccessToken, userRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
})

async function startServer() {
    try {
        // Don't connect Redis in testing
        if (!isTest) {
            await redisClient.connect();
        }

        return app.listen(PORT, () => {
            console.log(`Server running!`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = {app, startServer, redisClient};