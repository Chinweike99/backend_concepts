import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.errors({stack: true}),
        winston.format.splat(),
    ),
    defaultMeta : {service: "post-service"},
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({filename: "post-error.log", level: "error"}),
        new winston.transports.File({filename: "combined.log"}),
    ]
});

export default logger;