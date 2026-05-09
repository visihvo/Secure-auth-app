function csrfMiddleware(req, res, next) {
    console.log("=== CSRF MIDDLEWARE HIT ===");
    console.log("Header token:", req.headers["x-csrf-token"]);
    console.log("Session token:", req.session.csrfToken);
    console.log("Session ID:", req.sessionID);
    console.log("Cookies:", req.headers.cookie);

    const header = req.headers["x-csrf-token"];
    const sessionToken = req.session?.csrfToken;

    if (!header) {
        console.log("CSRF FAIL: Missing header");
        return res.status(403).json({ error: "Missing CSRF header" });
    }

    if (!sessionToken) {
        console.log("CSRF FAIL: Missing session token");
        return res.status(403).json({ error: "Missing CSRF session token" });
    }

    if (header !== sessionToken) {
        console.log("CSRF FAIL: Token mismatch");
        return res.status(403).json({ error: "Invalid CSRF token" });
    }

    if (!header || header !== sessionToken) {
        return res.status(403).json({ message: "Invalid CSRF" });
    }

    next();
}

module.exports = csrfMiddleware;