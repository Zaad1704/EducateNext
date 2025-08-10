// backend/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuditLog } from './auditLogger';

// Extend the Request interface to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        institutionId: string;
        email: string;
        name: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    await logFailedAuth(req, 'No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'educatenext',
      audience: 'educatenext-users'
    }) as any;
    
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      await logFailedAuth(req, 'User not found', decoded.user.id);
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    if (user.status !== 'active') {
      await logFailedAuth(req, 'User account inactive', user._id.toString());
      return res.status(401).json({ error: 'Account is not active' });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      institutionId: user.institutionId.toString(),
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (err: any) {
    await logFailedAuth(req, `Token verification failed: ${err.message}`);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.error('Auth middleware error:', err);
    res.status(401).json({ error: 'Token verification failed' });
  }
};

async function logFailedAuth(req: Request, reason: string, userId?: string) {
  try {
    await new AuditLog({
      userId: userId || null,
      action: 'AUTH_FAILED',
      resource: 'authentication',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: reason,
      sensitiveData: true
    }).save();
  } catch (error) {
    console.error('Failed to log auth failure:', error);
  }
}

// Alias for backward compatibility
export const protect = authMiddleware;
export const authenticateToken = authMiddleware;

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      await new AuditLog({
        userId: req.user.id,
        institutionId: req.user.institutionId,
        action: 'ACCESS_DENIED',
        resource: req.path,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: `Insufficient permissions. Required: ${roles.join(', ')}, Has: ${req.user.role}`,
        sensitiveData: true
      }).save().catch(err => console.error('Failed to log access denial:', err));
      
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

export const requireInstitutionAccess = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const resourceInstitutionId = req.params.institutionId || req.body.institutionId;
  
  if (resourceInstitutionId && resourceInstitutionId !== req.user.institutionId) {
    await new AuditLog({
      userId: req.user.id,
      institutionId: req.user.institutionId,
      action: 'CROSS_INSTITUTION_ACCESS_DENIED',
      resource: req.path,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: 'Attempted to access resource from different institution',
      sensitiveData: true
    }).save().catch(err => console.error('Failed to log cross-institution access:', err));
    
    return res.status(403).json({ error: 'Access denied. Institution mismatch.' });
  }

  next();
};

// Backward compatibility
export const protect = authMiddleware;
export const authenticateToken = authMiddleware;
export const authorize = requireRole;
