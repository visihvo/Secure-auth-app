const jwt = require("jsonwebtoken");

function authenticateAccessToken(req, res, next) {
    console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_SECRET);
    console.log("=== AUTH DEBUG START ===");
    console.log("Authorization header:", req.headers.authorization);
    console.log("Cookies:", req.headers.cookie);
    console.log("Session ID:", req.sessionID);
    console.log("========================");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log("AUTH FAIL: Missing Authorization header");
        return res.status(403).json({ error: "Missing access token" });
    }

    const token = authHeader?.split(" ")[1];
    console.log("Extracted token:", token);

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        console.log("AUTH SUCCESS:", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("AUTH FAIL: Invalid token", err.message);
        return res.status(403).json({ error: "Invalid access token" });
    }

    /* 
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    });*/
}

module.exports = authenticateAccessToken;