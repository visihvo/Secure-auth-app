const jwt = require("jsonwebtoken");
const { log } = require("../utils/logger");

function authenticateAccessToken(req, res, next) {
    log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_SECRET);
    log("=== AUTH DEBUG START ===");
    log("Authorization header:", req.headers.authorization); 
    log("Cookies:", req.headers.cookie); 
    log("Session ID:", req.sessionID); 
    log("========================"); 

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        log("AUTH FAIL: Missing Authorization header");
        return res.status(403).json({ error: "Missing access token" });
    }

    const token = authHeader?.split(" ")[1];
    log("Extracted token:", token);

    if (!token) {
        log("AUTH FAIL: Malformed Authorization header");
        return res.status(401).json({ error: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        
        log("AUTH SUCCESS:", decoded);
        
        req.user = decoded;
        next();
    } catch (err) {
        log("AUTH FAIL: Invalid token", err.message);
        return res.status(403).json({ error: "Invalid access token" });
    }
}

module.exports = authenticateAccessToken;