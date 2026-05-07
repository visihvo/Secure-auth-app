const express = require("express");
const router = express.Router();

router.get("/profile", (req, res) => {
    res.json({
        userId: req.user.id,
        username: req.user.username
    });
});

module.exports = router;