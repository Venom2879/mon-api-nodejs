const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");

router.post("/register", async (req, res) => {
    try {
        const user = User(req.body);
        await user.validate();

        const hash = await bcrypt.hash(user.password, 10);

        await user.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                error: {
                    code: "EMAIL_ALREADY_EXIST",
                    message: "Email already exists",
                },
            });
        }

        if (err.name === "ValidationError") {
            const validations = Object.values(err.errors).map(e => ({
                message: e.message,
                field: e.path, // correspond au champ Mongoose (email, name, etc.)
            }));

            return res.status(500).json({
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
        console.log(err);
    }
});

module.exports = router;
