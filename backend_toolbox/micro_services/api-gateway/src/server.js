import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import {RedisStore} from 'rate-limit-redis'
import logger from './utils/logger.js';
import proxy from 'express-http-proxy';
import { errorHandler } from './middlewares/errorHandler.js';
import { validatePostToken } from './middlewares/authMiddleware.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
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
  

const rateLimiter = rateLimit({
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

app.use(rateLimiter);


const proxyOptions = {
    proxyReqPathResolver : (req) => {
        return req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler : (err, res, next) => {
        logger.error(`Proxy error: ${err.message}`);
        res.status(500).json({
            messgae: "Internal Server error: ", error : err.message
        })
    }
}


// Setting up proxy for identity service
app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq)=>{
        console.log("Forwarding user:", srcReq.user); 
        proxyReqOpts.headers['Content-Type'] = "application/json";
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, uerRes) => {
        logger.info(`Response recieved from identity service: ${proxyRes.statusCode}`);
        return proxyResData;
    }
}));


// Setting up proxy for our post service
app.use('/v1/posts', validatePostToken, proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq)=>{
        proxyReqOpts.headers['Content-Type'] = "application/json";
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, uerRes) => {
        logger.info(`Response recieved from id post service: ${proxyRes.statusCode}`);
        return proxyResData;
    }
}))




app.use(errorHandler)


app.listen(PORT, () => {
    console.log(`Gateway running on http://localhost${PORT}`);
    logger.info(`API GATEWAY is running on port ${PORT}`);
    logger.info(`IDENTITY SERVICE is running on ${process.env.IDENTITY_SERVICE_URL}`)
    logger.info(`POST SERVICE is running on ${process.env.POST_SERVICE_URL}`)
})









