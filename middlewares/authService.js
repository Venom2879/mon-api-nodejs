const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyToken = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return next(
            res.status(401).json({
                error: {
                    code: "MISSING_TOKEN",
                    message: "Missing token",
                },
            }),
        );
    }

    const token = header.split("Bearer ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                return next(
                    res.status(401).json({
                        error: {
                            code: "TOKEN_EXPIRED",
                            message: "Token expired",
                        },
                    }),
                );
            }

            return next(
                res.status(401).json({
                    error: {
                        code: "TOKEN_EXPIRED",
                        message: "Token expired",
                    },
                }),
            );
        }

        req.userId = decoded.userId;
        next();
    });
};
