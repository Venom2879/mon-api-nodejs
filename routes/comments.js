const express = require("express");
// const mongoose = require("mongoose");
const router = express.Router();

const Comment = require("../models/Comment");
const authService = require("../middlewares/authService");

router.post("/posts/:postId", authService.verifyToken, async (req, res) => {
    const { postId } = req.params;

    try {
        const comment = Comment(req.body);
        await comment.validate();

        comment._postId = postId;
        comment._userId = req.userId;

        await comment.save();

        return res.status(201).json({
            success: true,
            message: "Comment created successfully",
            comment: comment,
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

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const comment = await Comment.findById(id).populate({
            path: "_userId",
            select: "username",
        });

        if (!comment) {
            return res.status(404).json({
                error: {
                    code: "RESOURCE_NOT_FOUND",
                    message: "Comment not found",
                },
            });
        }

        return res.status(200).json(comment);

    } catch (err) {

        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An error occurred",
            },
        });

    }
});

module.exports = router;
