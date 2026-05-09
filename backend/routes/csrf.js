const express = require("express");
const router = express.Router();
const { setCsrfToken } = require("../utils/csrf");

router.get("/csrf-token", (req, res) => {
    const token = setCsrfToken(req);
    res.json({ csrfToken: token });
});

module.exports = router;