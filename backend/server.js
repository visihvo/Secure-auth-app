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

(async () => {
    const redisClient = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379"
    });

    redisClient.on("error", (err) => {
        console.error("Redis error:", err);
    });

    await redisClient.connect();

    app.use(helmet());

    app.use(cors({ 
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "x-csrf-token", "Cookie"],
        exposedHeaders: ["Set-Cookie"]
    }));

    app.use(express.json());
    app.use(cookieParser());


    app.use(
        session({
            store: new RedisStore({
                client: redisClient,
                prefix: "sess:"
            }),

            name: "sid",

            secret: process.env.SESSION_SECRET,

            resave: false,
            saveUninitialized: false,

            rolling: false,

            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 7
            }
        })
    );

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
    });

    app.use((req, res, next) => {
        console.log("method:", req.method);
        console.log("path:", req.path);
        console.log("csrf header:", req.headers["x-csrf-token"]);
        console.log("cookies:", req.headers.cookie);
        next();
    });

    // CSRF Token
    app.get("/api/csrf-token", (req, res) => {
        if (!req.session.csrfToken) {
            req.session.csrfToken = require("crypto").randomBytes(32).toString("hex");
        }

        res.json({ csrfToken: req.session.csrfToken });
    });

    // Public routes - no csrf
    // login, register, refresh, check-user
    app.use("/api/auth", authRoutes);

    // Protected user routes - requires access token 
    // eg. /api/user/profile
    app.use("/api/user", authenticateAccessToken, userRoutes);

    /*
    app.post(
        "/api/auth/logout",
        authenticateAccessToken,
        csrfMiddleware,
        (req, res) => {

            res.clearCookie("refreshToken", {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/"
            });

            req.session.destroy(() => {
                res.json({ message: "Logged out" });
            });
        }
    ); */

    // Error handling
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    })

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();