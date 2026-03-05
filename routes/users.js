const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const offset = (page - 1) * size;

    try {
        const [users, count] = await Promise.all([
            User.find()
                .select("_id username email")
                .sort({ "createdAt": -1 })
                .skip(offset)
                .limit(size)
                .lean() // plus performant si pas besoin des méthodes mongoose pour nos objets
            , User.countDocuments(),
        ]);

        return res.status(200).json({
            data: users,
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

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id)
            .select("_id username email")
            .lean();

        if (!user) {
            return res.status(404).json({
                error: {
                    code: "RESOURCE_NOT_FOUND",
                    message: "User not found",
                },
            });
        }

        return res.status(200).json(user);

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
