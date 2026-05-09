const { validateCsrf } = require("../utils/csrf");

function verifyCsrf(req, res, next) {
    if (!validateCsrf(req)) {
        console.log("Potential CSRF attack detected");
        return res.status(403).json({ error: "Invalid or missing CSRF token" });
    }
    next();
}

module.exports = verifyCsrf;