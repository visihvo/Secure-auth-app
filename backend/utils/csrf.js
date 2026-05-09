const crypto = require("crypto");

function generateCsrfToken() {
    return crypto.randomBytes(32).toString("hex");
}

function setCsrfToken(req) {
    const token = generateCsrfToken();
    req.session.csrfToken = token;
    return token;
}

function validateCsrf(req) {
    const sent = req.headers["x-csrf-token"];
    const stored = req.session.csrfToken;
    return sent && stored && sent === stored;
}

module.exports = { setCsrfToken, validateCsrf };