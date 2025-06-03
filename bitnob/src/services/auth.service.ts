import jwt from 'jsonwebtoken'
import { LoginUserInput, RegisterUserInput } from '../types/user.types'
import User from '../models/user';
import  argon2  from 'argon2';
import env from '../config/env'
import logger from '../utils/logger';



export const registerUser = async (input: RegisterUserInput) => {
    try {
        const {email, password, firstName, lastName, phoneNumber} = input;
        const existingUser = await User.findOne({email});

        if (existingUser) {
            throw new Error('Email already in use');
          }
        // const hashedPassword = await argon2.hash(password);

    const user = await User.create({
        firstName,
        lastName,
        email,
        // password: hashedPassword,
        password,
        phoneNumber,
      });

      // Generate JWT token
      const token = jwt.sign({ id:user._id }, env.JWT_SECRET, 
        { expiresIn: env.JWT_EXPIRES_IN || '1d'} as any ,
      )

      return {user, token}

    } catch (error) {
        logger.error('Error in registerUser:', error);
        throw error;
    }
}



export const loginUser = async (input: LoginUserInput) => {
    try {
      const { email, password } = input;
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid email password');
      }
  
      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN || '1d',
      } as any);
  
      return { user, token };
    } catch (error: any) {
      logger.error('Error in loginUser:', error);
      throw error;
    }
  };


