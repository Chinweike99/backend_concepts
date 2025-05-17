import logger from "../utils/logger.js";
import jwt from 'jsonwebtoken';

export const validatePostToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        logger.warn("Access attempt failed, no valid token");
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            logger.warn("Invalid token");
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        req.user = decoded; // ← Correct! Set user payload from token
        next();
    });
};
