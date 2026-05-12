const jwt = require("jsonwebtoken");

function authenticateAccessToken(req, res, next) {
    const isDev = process.env.NODE_ENV === ("development" || "test");

    if (isDev) {
        console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_SECRET);
        console.log("=== AUTH DEBUG START ===");
        console.log("Authorization header:", req.headers.authorization);
        console.log("Cookies:", req.headers.cookie);
        console.log("Session ID:", req.sessionID);
        console.log("========================");
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log("AUTH FAIL: Missing Authorization header");
        return res.status(403).json({ error: "Missing access token" });
    }

    const token = authHeader?.split(" ")[1];
    if (isDev) console.log("Extracted token:", token);

    if (!token) {
        if (isDev) console.log("AUTH FAIL: Malformed Authorization header");
        return res.status(401).json({ error: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        
        if (isDev) console.log("AUTH SUCCESS:", decoded);
        
        req.user = decoded;
        next();
    } catch (err) {
        if (isDev) console.log("AUTH FAIL: Invalid token", err.message);
        return res.status(403).json({ error: "Invalid access token" });
    }
}

module.exports = authenticateAccessToken;