// backend/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Request interface to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        institutionId: string;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Get token from header
  const token = req.header('x-auth-token'); // Common practice to send token in 'x-auth-token' header

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey') as { user: { id: string, role: string, institutionId: string } };

    // Attach user from payload to request object
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
}
