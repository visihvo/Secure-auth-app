const db = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const registerSchema = require("../utils/validation");
const { log } = require("../utils/logger");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

/**
 * Helper function for SELECT queries.
 * Uses parametrized SQL queries to prevent SQL injection.
 * 
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns Database row
 */
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

/**
 * Helper function for INSERT/UPDATE/DELETE queries.
 * Uses parameterized queries to safely handle user input.
 * 
 * @param {*} sql - SQL query string
 * @param {*} params - Query parameters
 * @returns SQL execution result
 */
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

/**
 * Registers a new user.
 * 
 * Security features:
 * - Backend validation using Zod schema
 * - Parametrized SQL queries
 * - Password hashing using bcrypt
 * - Secure UUID generation
 * @param {Object} data User registration data from frontend (credentials)
 * @returns Registration success
 * @throws {Error} Throws if validation fails or user already exists
 */
exports.register = async (data) => {
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
        throw parsed.error;
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

/**
 * Authenticates a user and generates JWT tokens.
 * 
 * Security features:
 * - Generic authentication messages
 * - Secure password verification with bcrypt
 * - JWT access and refresh token generation
 * 
 * @param {Object} data - Login request data (credentials)
 * @returns Resolves with generated tokens and username
 * @throws {Error} Throws if credentials are invalid.
 */
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

    // Compare given password to password stored for given username
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

/**
 * Generates a new access token using a valid refresh token.
 * 
 * Security features:
 * - Refresh token verification
 * - Short-lived access tokens
 * 
 * @param {string} token - Refresh token
 * @returns Resolves with a new JWT access token
 * @throws {Error} Throws if token is missing or invalid
 */
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

/**
 * Checks whether username or email already exists.
 * 
 * Used for frontend validation and registration checks.
 * 
 * @param {*} query - User lookup data (username and email)
 * @returns Resolves with username/email existence 
 */
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