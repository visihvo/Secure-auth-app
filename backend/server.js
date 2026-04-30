require("dotenv").config();
require("./database");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");

const authRoutes = require("./routes/authRoutes");
const authenticateToken = require("./middleware/authMiddleware");
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

app.get("/api/csrf-token", (req, res, next) => {
    csrfProtection(req, res, (err) => {
        if (err) return next(err);

        res.json({
            csrfToken: req.csrfToken()
        });
    });
});

app.use("/api/auth", csrfProtection, authRoutes);

app.get("api/user/profile", authenticateAccessToken, (req, res) => {
    res.json({ 
        userId: req.user.id,
        username: req.user.username
    });
});

app.get("/api/user/profile", authenticateToken, (req, res) => {
    res.json({ 
        userId: req.user.id,
        username: req.user.username
    });
});

app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ error: "Invalid CSRF token" });
    }

    console.error(err);
    res.status(500).json({ error: "Server error" });
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));