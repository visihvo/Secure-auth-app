const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function generateAccessToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username
        },
        process.env.ACCESS_SECRET,
        {
            expiresIn: "15m"
        }
    );
}

function generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

function hashToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    hashToken
};