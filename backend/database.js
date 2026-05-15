const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const { log } = require("./utils/logger");

// Path to database directory and full database path
const dataDir = path.resolve(__dirname, "data");
const dbPath = path.join(dataDir, "database.db");

// Confirm database storage directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Check if database file exists
const isNewDb = !fs.existsSync(dbPath);

/**
 * Connect to database
 * 
 * Security:
 * - Access restricted to backend server
 * - Errors handled safely and logged server sided
 */
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection failed", err);
    } else {
        console.log(
            isNewDb
                ? "No database found - creating a new one"
                : "Connected to database"
        );
    }
});

/**
 * Database initialization
 * 
 * Creates database table if database didn't exist
 */
if (isNewDb) {
    db.serialize(() => {
        /**
         * Creates user table
         * 
         * Properties:
         * - Unique id (created with randomUUID())
         * - Unique username
         * - Unique email
         * - Password stored hashed
         * - Refresh tokens stored server side
         * - Logging and error handling server side
         */
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                refresh_token TEXT
            )
        `, (err) => {
            if (err) { 
                log("Table creation error:", err); 
            } else {
                log("Users table created");
            }
        });
    });
}

module.exports = db;