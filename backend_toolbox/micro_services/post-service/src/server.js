import routes from "./routes/post-routes.js";
import express from "express";
import mongoose from "mongoose";
import Redis from "ioredis";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis'

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Connect to mongoose
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("connected to mongoDb"))
  .catch((e) => logger.error("Mongo connection error", e));


  const redisClient = new Redis(process.env.REDIS_URL);

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  
  // All for logging purposes
  app.use((req, res, next) => {
    logger.info(`Recieved ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
  });
  


// IP based rate limiting
export const postIpRateLimit  =  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many request has been sent",
    handler: (req, res)=>{
        res.status(429).json({
            success: false,
            message: "Too many request sent, try in 15 minutes,"
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
});


// app.use('/api/posts', postIpRateLimit)

app.use('/api/posts', (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, routes)


app.use(errorHandler);


app.listen(port, () => {
  logger.warn(`Server running on port: http://localhost:${port}`);
  console.log("Server started 😎");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason", reason);
});
