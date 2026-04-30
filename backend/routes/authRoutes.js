require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../database");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER ROUTE
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Step 1: check if username or email already exists
        db.get(
            "SELECT username, email FROM users WHERE username = ? OR email = ?",
            [username, email],
            async (err, user) => {
                if (err) {
                    console.error("SQLite error:", err);
                    return res.status(500).json({ error: "Database error" });
                }

                if (user) {
                    return res.status(400).json({
                        usernameExists: user.username === username,
                        emailExists: user.email === email,
                        error: "Username or email already exists"
                    });
                }

                // Step 2: hash password
                const hash = await bcrypt.hash(password, 12);

                // Step 3: insert new user
                db.run(
                    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                    [username, email, hash],
                    function (err) {
                        if (err) {
                            console.error("SQLite insert error:", err);
                            return res.status(500).json({ error: "Database error" });
                        }

                        res.json({ message: "User registered successfully" });
                    }
                );
            }
        );
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    db.get("SELECT * FROM users WHERE username = ?", 
        [username],
        async(err, user) => {
            if (err) return res.status(500).json({ error: "Database error" });
            if (!user) return res.status(400).json({ error: "Invalid credentials" });

            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) return res.status(400).json({ error: "Invalid credentials" });

            const accessToken = jwt.sign(
                { id: user.id, username: user.username },
                process.env.ACCESS_SECRET || JWT_SECRET,
                { expiresIn: "15m" }
            );

            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.REFRESH_SECRET || JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/api/auth/refresh"
            });

            res.json({
                accessToken,
                username: user.username
            });
    });
});



router.post("/logout", (req, res) => {
    const token = req.cookies.refreshToken;

    if (token) {
        try {
            const decoded = jwt.decode(token);

            if (decoded?.id) {
                db.run(
                    "UPDATE users SET refresh_token = NULL WHERE id = ?",
                    [decoded.id]
                );
            }
        } catch {}
    }

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh"
    });

    res.json({ message: "Logged out" });
});

router.post("/refresh", (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        const newAccessToken = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.json({ accessToken: newAccessToken });
    });
});

router.get("/check-user", (req, res) => {
    const { username, email } = req.query;

    db.get(
        "SELECT username, email FROM users WHERE username = ? OR email = ?",
        [username, email],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }

            if (!user) {
                return res.json({
                    usernameExists: false,
                    emailExists: false
                });
            }

            return res.status(400).json({
                error: "Username or email already exists"
            });
        }
    );
})

module.exports = router;