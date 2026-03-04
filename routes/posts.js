const express = require("express");
const router = express.Router();

const authService = require("../middlewares/authService");
const Post = require("../models/Post");

router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const offset = (page - 1) * size;

    try {
        const [posts, count] = await Promise.all([
            Post.find()
                .sort({"createdAt": -1})
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
    const {title, content, status} = req.body;

    try {
        const post = Post({title, content, status});
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
