const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.resolve(__dirname, "database.db");
const isNewDb = !fs.existsSync(dbPath);

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

if (isNewDb) {
    db.serialize(() => {
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
                console.error("Table creation error:", err); 
            } else {
            console.log("Users table created");
            }
        });
    });
}

module.exports = db;