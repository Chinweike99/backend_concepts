import logger from "../utils/logger.js";


export const authicateRequest = (req, res, next) => {
    const userId = req.headers['x-user-id'];

    if(!userId){
        logger.warn(`Access attempted without ID`);
        return res.status(401).json({
            success: false,
            message: "Authentication is required, Please try logging in"
        })
    };

    req.user = {userId};
    next();
}

