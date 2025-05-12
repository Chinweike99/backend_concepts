import mongoose from "mongoose";
import logger from "./utils/logger.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import routes from "./routes/identity_service.js";
import { errorHandler } from "./middlewares/errorHandlers.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("connected to mongoDB"))
  .catch((e) => logger.error("MogoDb connection error", e));

console.log("\n \nMONGODB_URL, connection successful");

// const redisClient = new Redis.createClient(process.env.REDIS_URL);
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("error", (error) => {
  console.log("Error connecting to redis: ", error);
  logger.error(error);
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis successfully");
});

// All for logging purposes
app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

//DDos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 30, // number of requests
  duration: 60, // minutes (30 requests in 60 seconds)
  keyPrefix: "middleware",
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (error) {
    res.status(429).json({
      status: false,
      message: "Too many requests",
    });
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
  }
};

app.use(rateLimiterMiddleware);

// IP based rate limiting for sensitive endpoints (Express)
const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many request sent",
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// Apply this sensitiveEndpointLimiter to our routes
app.use("/api/auth/register", sensitiveEndpointLimiter);

// All Routes
app.use("/api/auth", routes);

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
  logger.warn(`Server running on port: http://localhost:${port}`);
  console.log("Server started 😎");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason", reason);
});
