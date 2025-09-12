import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  
  // This will be implemented after we add admin check to the user model
  // For now, we'll assume all users are not admin
  if (!user || !user.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  
  next();
};