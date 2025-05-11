import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/refresh_token.js';


export const generateToken = async(user)=>{
    const accessToken = jwt.sign({
        userId: user._id,
        username: user.username
    }, process.env.JWT_SECRET, {expiresIn: '60m'});

    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7) // Refresh token expires in 7 days

    await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt
    });
    return {accessToken, refreshToken}

}


