import mongoose, { Document } from "mongoose";
import argon2 from 'argon2';


export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    isVerified: boolean;
    comparePassword(candidatePassword: string) : Promise<boolean>
};

const UserSchema = new mongoose.Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phoneNumber: { type: String, required: true, unique: true },
        isVerified: { type: Boolean, default: false },
      },
      { timestamps: true }
);

UserSchema.pre('save', async function(next) {
    if(!this.isModified('password'))
        return next();
    this.password = await argon2.hash(this.password);
    next();
})

UserSchema.methods.comparePassword = async function (candidatePassword: string){
    const user = this as IUser;
    return await argon2.verify(user.password, candidatePassword);
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;


