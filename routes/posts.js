const express = require("express");
const router = express.Router();
const sanitizeHtml = require("sanitize-html");

const authService = require("../middlewares/authService");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const offset = (page - 1) * size;

    try {
        const [posts, count] = await Promise.all([
            Post.find({ status: "Publish" })
                .sort({ "createdAt": -1 })
                .populate({
                    path: "_userId",
                    select: "username", // ou "username email" etc.
                })
                .skip(offset)
                .limit(size)
                .lean() // plus performant si pas besoin des méthodes mongoose pour nos objets
            , Post.countDocuments(),
        ]);

        return res.status(200).json({
            data: posts,
            meta: { page, size, count },
        });

    } catch (err) {

        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred",
            },
        });
    }
});

router.post("/new", authService.verifyToken, async (req, res) => {
    const { title, content, status } = req.body;

    try {
        const clean = sanitizeHtml(content, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                "img", "h1", "h2", "h3", "pre", "code",
            ]),
            allowedAttributes: {
                a: ["href", "name", "target"],
                img: ["src", "alt"],
            },
        });

        const post = Post({ title, content: clean, status });
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
                    validations: validations,
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
        const post = await Post.findById(id).populate({
            path: "_userId",
            select: "username", // ou "username email" etc
        });

        if (!post) {
            return res.status(404).json({
                error: {
                    code: "RESOURCE_NOT_FOUND",
                    message: "Post not found",
                },
            });
        }

        const comments = await Comment.find({ _postId: post._id })
            .sort({ "createdAt": -1 })
            .populate({
                path: "_userId",
                select: "username",
            });

        return res.status(200).json({
            post: post,
            comments: comments,
        });

    } catch (err) {

        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An error occurred",
            },
        });
    }

});

router.patch("/:id", authService.verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        let post = await Post.findById(id).lean();

        if (!post) {
            return res.status(404).json({
                error: {
                    code: "RESOURCE_NOT_FOUND",
                    message: "Post not found",
                },
            });
        }

        if (post._userId.toString() !== req.userId) {
            return res.status(403).json({
                error: {
                    code: "NOT_RESOURCE_OWNER",
                    message: "You cannot modify this post",
                },
            });
        }

        if (req.body && req.body.content) {
            req.body.content = sanitizeHtml(req.body.content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                    "img", "h1", "h2", "h3", "pre", "code",
                ]),
                allowedAttributes: {
                    a: ["href", "name", "target"],
                    img: ["src", "alt"],
                },
            });
        }

        post = await Post.findByIdAndUpdate(id, req.body, {
            runValidators: true,
            returnDocument: "after",
        });

        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            post: post,
        });

    } catch (err) {

        if (err.name === "ValidationError") {
            const validations = Object.values(err.errors).map(e => ({
                message: e.message,
                field: e.path, // correspond au champ Mongoose (title, content, etc.)
            }));

            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Validation error",
                    validations: validations,
                },
            });
        }

        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred",
            },
        });
    }
});

router.delete("/:id", authService.verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                error: {
                    code: "RESOURCE_NOT_FOUND",
                    message: "Post not found",
                },
            });
        }

        if (post._userId.toString() !== req.userId) {
            return res.status(403).json({
                error: {
                    code: "NOT_RESOURCE_OWNER",
                    message: "You cannot delete this post",
                },
            });
        }

        await Post.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        });

    } catch (err) {
        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred",
            },
        });
    }
});


module.exports = router;
