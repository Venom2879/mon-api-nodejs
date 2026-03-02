const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "Page index",
    });
});

router.get("/about", (req, res) => {
    res.json({
        message: "Page about",
    });
});

module.exports = router;
