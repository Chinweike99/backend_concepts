import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import logger from "../utils/logger.js"
import { validateReg } from "../utils/validation.js";


console.log(logger);
// User Registration
export const registerUser = async(req, res) => {
    logger.info("Registration data....")
    try {
        const {error} = validateReg(req.body);
        if(error){
            logger.warn("Validation error", error.details?.[0]?.message || error.message);
            return res.status(400).json({message: error.message})
        }

        const {username, email, password} = req.body
        let user = await User.findOne({ $or : [{email}, {username}]});
        if(user){
            logger.warn("User exists", {email, username});
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        user = new User({
            username, email, password
        });
        await user.save();
        logger.warn("User saved successfully: ", user._id);

        const {accessToken, refreshToken} = await generateToken(user);
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            accessToken,
            refreshToken
        })
        return user;

    } catch (error) {
        logger.error("Registration error", error);
        console.log(error)
    }
}


//User Login



// Refresh Token


//Logout