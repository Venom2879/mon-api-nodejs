require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

router.post("/register", async (req, res) => {
    try {
        const user = User(req.body);
        await user.validate();

        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;

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
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid credentials",
                },
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid credentials",
                },
            });
        }
        const accessToken = jwt.sign({
            userId: user._id,
        }, process.env.JWT_SECRET, {
            expiresIn: "15min",
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken: accessToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
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
