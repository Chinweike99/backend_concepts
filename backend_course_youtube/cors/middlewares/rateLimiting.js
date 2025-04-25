import rateLimit from 'express-rate-limit'


export const rateLimiter = (maxRequests, time) => {
    return rateLimit({
        time: time,
        max: maxRequests,
        message: "Too many requests, try again later",
        standardHeaders: true,
        legacyHeaders: false,
    })
}

