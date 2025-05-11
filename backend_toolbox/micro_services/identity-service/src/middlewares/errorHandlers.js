import logger from "../utils/logger";


export const errorHandler = (error, req, res, next) => {
    logger.error(error.stack);

    res.status(error.status || 500).json({
        message: error.message || 'Internal server error'
    })
}