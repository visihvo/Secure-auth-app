const authService = require("../services/authService");

const isDev = process.env.NODE_ENV === ("development");

exports.register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        
        return res.json({
            success: true,
            data: result
        });

    } catch (err) {
        return res.status(400).json({ 
            success: false,    
            error: "Registration failed"
        });
    }
};

exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return res.json({ 
            success: true,
            data: {
                accessToken: result.accessToken,
                username: result.username
            }
        });

    } catch (err) {
        return res.status(400).json({ 
            success: false,
            error: "Invalid credentials"
        });
    }
};

exports.logout = async (req, res) => {
    try {
        if (isDev) { console.log("=== LOGOUT CONTROLLER HIT ==="); console.log("User:", req.user); console.log("Session ID:", req.sessionID);}

        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(204).end();
        }

        if (isDev) console.log("COOKIE:", req.cookies);

        res.clearCookie("refreshToken", {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        req.sessionStore.destroy(req.sessionID, (err) => {
            if (err) {
                if (isDev) console.log("Session destroy error:", err);
                return res.status(500).json({ error: "Failed to destroy session" });
            }

            res.clearCookie("sid");

            return res.json({
                success: true,
                data: { message: "Logged out" }
            });
        });

    } catch (err) {
        if (isDev) console.log("Logout error:", err);
        return res.status(500).json({
            success: false,
            error: "Logout failed"
        });
    }
};

exports.refresh = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) return res.status(401).json({
            success: false,
            error: "No token"
        });

        const accessToken = await authService.refresh(token);

        return res.json({ 
            success: true,
            data: {
                accessToken
            }
        });

    } catch(err) {
        return res.status(403).json({
            success: false,
            error: "Invalid token"
        });
    }
};

exports.checkUser = async(req, res) => {
    try {
        const result = await authService.checkUser(req.query);
        return res.json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: "Request failed" 
        });
    }
};