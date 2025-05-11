import mongoose from "mongoose";
import User from "./User.js";

const refreshTokenSchema = new mongoose.Schema({
    token: {type: String, required: true, unique: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: User, required: true},
    expiresAt: {type: Date, required: true}
}, {timestamps: true});

refreshTokenSchema.index({expiresAt: 1}, {expiresAfterSeconds : 0})

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;