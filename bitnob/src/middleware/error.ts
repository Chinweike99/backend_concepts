import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";


export const errorHandler = (
    err: Error, req:Request, res: Response, next: NextFunction
): void => {
    logger.error(`Error: ${err.message}`);

    if(err.name === 'ValidationError'){
     res.status(400).json({message: err.message})
     return
    }if (err.name === 'UnauthorizedError') {
     res.status(401).json({ message: 'Unauthorized' });
     return
      }
    res.status(500).json({message: "Something went wrong"});
}

export const notFound = (req: Request, res: Response) => {
    res.status(404).json({ message: 'Not Found' });
  };