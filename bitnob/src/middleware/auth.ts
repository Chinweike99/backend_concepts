import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import logger from "../utils/logger";
import env from '../config/env'

export const authenticate = (req:Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
    
        if (!token) {
          return res.status(401).json({ message: 'No token, authorization denied' });
        }
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
        req.userId = decoded.id;
        next();
      } catch (error) {
        logger.error('Error in authentication middleware:', error);
        res.status(401).json({ message: 'Token is not valid' });
      }
}



