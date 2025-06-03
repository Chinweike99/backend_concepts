import rateLimit from "express-rate-limit";
import logger from "../utils/logger";
import env from '../config/env'


export const apiRateLimiter=rateLimit({
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(env.RATE_LIMIT_MAX),
  handler: (req, res) => {
    logger.warn(`Rate limist exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many requests, please try again later',
    });
  },
})
