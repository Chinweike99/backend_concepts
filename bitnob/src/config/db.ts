import mongoose from "mongoose";
import env from './env'


export const connectDb = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("MongoDB connection Error: ", error);
    }
}