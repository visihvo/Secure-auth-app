require("dotenv").config();
require("./database");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const authenticateAccessToken = require("./middleware/authAccessToken");

const app = express();
const PORT = 5000; // Hide this?

app.use(helmet());

app.use(cors({ 
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use("/api/auth", limiter);

const csrfProtection = csurf({
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    }
});

app.get("/api/csrf-token", csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

/* 
// CSRF Token endpoint
app.get("/api/csrf-token", (req, res, next) => {
    csrfProtection(req, res, (err) => {
        if (err) return next(err);

        res.json({
            csrfToken: req.csrfToken()
        });
    });
});
*/

// Public routes - no csrf
// login, register, refresh, check-user
app.use("/api/auth", authRoutes);

// Protected user routes - requires access token + CSRF
// eg. /api/user/profile
app.use("/api/user", authenticateAccessToken, csrfProtection, userRoutes);

app.post(
    "/api/auth/logout",
    authenticateAccessToken,
    csrfProtection,
    (req, res) => {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/"
        });

        res.clearCookie("_csrf", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/"
        });

        res.json({ message: "Logged out"})
    }
);

// Error handling
app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ error: "Invalid CSRF token" });
    }

    console.error(err);
    res.status(500).json({ error: "Server error" });
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));