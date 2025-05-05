import mongoose from 'mongoose';
import argon2 from 'argon2';


const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true},
    password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    timestamps: true
});

userSchema.pre("save", async function(next){
    if(this.isModified('password')){
        try {
            this.password = await argon2.hash(this.password)
            next()
        } catch (error) {
            return next(error)
        }
    }
})


userSchema.methods.comparePasswords = async function(candidatePassword) {
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (error) {
       console.log("Password verification error", error); 
    }
}


userSchema.index({username: "text"});

const User = mongoose.model("User", userSchema);
export default User;