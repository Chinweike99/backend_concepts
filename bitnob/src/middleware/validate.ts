import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendErrorResponse } from '../utils/apiResponse';
import logger from '../utils/logger';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the entire request object (body, params, query)
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.error('Validation error:', errors);
        
        return sendErrorResponse(
          res, 
          'Validation failed', 
          400, 
          errors
        );
      }
      
      // Handle unexpected errors
      logger.error('Unexpected validation error:', error);
      return sendErrorResponse(res, 'Internal server error', 500);
    }
  };
};
