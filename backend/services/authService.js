const db = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const registerSchema = require("../utils/validation");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

exports.register = async (data) => {
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
        throw new Error("Invalid input");
    }

    const { username, email, password } = parsed.data;

    const existingUser = await dbGet(
        "SELECT username, email FROM users WHERE username = ? OR email = ?",
        [username, email]
    );

    if (existingUser) {
        throw new Error("User or email already exists");
    }

    const hash = await bcrypt.hash(password, 12);
    const userID = randomUUID();

    await dbRun(
        "INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)",
        [userID, username, email, hash]
    );

    return { message: "User registered" };
};

exports.login = async (data) => {
    const { username, password } = data;

    if (!username || !password) {
        throw new Error("Missing fields");
    }

    const user = await dbGet(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );

    if (!user || !user.password_hash) {
        throw new Error("Invalid credentials");
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
        throw new Error("Invalid credentials");
    }

    const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return {
        accessToken,
        refreshToken,
        username: user.username
    };
};

exports.refresh = async (token) => {
    if (!token) {
        throw new Error("No token");
    }

    return new Promise((resolve, reject) => {
        jwt.verify(token, REFRESH_SECRET, (err, user) => {
            if (err) return reject(new Error("Invalid token"));

            const accessToken = jwt.sign(
                { id: user.id, username: user.username },
                ACCESS_SECRET,
                { expiresIn: "15m" }
            );

            resolve(accessToken);
        });
    });
};

exports.checkUser = async (query) => {
    const { username, email } = query;

    const user = await dbGet(
        "SELECT username, email FROM users WHERE username = ? OR email = ?",
        [username, email]
    );

    if (!user) {
        return {
            usernameExists: false,
            emailExists: false
        };
    }

    return {
        usernameExists: user.username === username,
        emailExists: user.email === email
    };
};