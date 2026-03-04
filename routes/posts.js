const express = require("express");
const router = express.Router();

const authService = require("../middlewares/authService");
const Post = require("../models/Post");

router.get("/", authService.verifyToken, (req, res) => {
    return res.status(200).json({
        message: "Welcome Back",
    });
});

router.post("/new", authService.verifyToken, async (req, res) => {
    const { title, content, status } = req.body;

    try {
        const post = Post({ title, content, status });
        await post.validate();

        post._userId = req.userId;
        await post.save();

        return res.status(201).json({
            success: true,
            message: "Post saved successfully",
            post: post,
        });

    } catch (err) {
        if (err.name === "ValidationError") {
            const validations = Object.values(err.errors).map(e => ({
                message: e.message,
                field: e.path, // correspond au champ Mongoose (email, name, etc.)
            }));

            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Validation error",
                    validation: validations,
                },
            });
        }
        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An error occurred",
            },
        });
    }

});

module.exports = router;
