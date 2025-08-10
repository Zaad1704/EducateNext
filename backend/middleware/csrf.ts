// backend/middleware/csrf.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { securityUtils } from '../config/security';
import { AuditLog } from './auditLogger';

declare global {
  namespace Express {
    interface Request {
      csrfToken?: () => string;
    }
  }
}

// Enhanced CSRF token generation
export const generateCSRFToken = (): string => {
  return securityUtils.generateCSRFToken();
};

// Enhanced CSRF protection middleware
export const csrfProtection = async (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for specific auth endpoints that handle CSRF differently
  const skipPaths = ['/auth/login', '/auth/register', '/auth/refresh-token'];
  if (skipPaths.some(path => req.path.includes(path))) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;
  const clientIp = req.ip;
  const userAgent = req.get('User-Agent');

  // Check if tokens exist
  if (!token || !sessionToken) {
    await new AuditLog({
      userId: req.user?.id || null,
      institutionId: req.user?.institutionId || null,
      action: 'CSRF_TOKEN_MISSING',
      resource: req.path,
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: false,
      errorMessage: 'CSRF token missing from request',
      sensitiveData: true,
      metadata: {
        hasHeaderToken: !!token,
        hasSessionToken: !!sessionToken
      }
    }).save().catch(err => console.error('Failed to log CSRF violation:', err));
    
    return res.status(403).json({ 
      error: 'CSRF token required',
      code: 'CSRF_TOKEN_MISSING'
    });
  }

  // Verify tokens using timing-safe comparison
  if (!securityUtils.verifyCSRFToken(token, sessionToken)) {
    await new AuditLog({
      userId: req.user?.id || null,
      institutionId: req.user?.institutionId || null,
      action: 'CSRF_TOKEN_INVALID',
      resource: req.path,
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: false,
      errorMessage: 'Invalid CSRF token provided',
      sensitiveData: true,
      metadata: {
        tokenLength: token.length,
        sessionTokenLength: sessionToken.length
      }
    }).save().catch(err => console.error('Failed to log CSRF violation:', err));
    
    return res.status(403).json({ 
      error: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  // Regenerate CSRF token for additional security (optional)
  if (Math.random() < 0.1) { // 10% chance to regenerate
    req.session!.csrfToken = generateCSRFToken();
  }

  next();
};

// Enhanced CSRF token setup
export const setCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  // Always generate a new token if none exists
  if (!req.session?.csrfToken) {
    req.session!.csrfToken = generateCSRFToken();
  }

  // Provide method to get current token
  req.csrfToken = () => req.session!.csrfToken;
  
  // Set token in response header for client access
  res.setHeader('X-CSRF-Token', req.session!.csrfToken);
  
  next();
};

// Secure CSRF token endpoint
export const getCSRFToken = async (req: Request, res: Response) => {
  try {
    // Generate new token
    const token = generateCSRFToken();
    req.session!.csrfToken = token;
    
    // Log token generation
    await new AuditLog({
      userId: req.user?.id || null,
      institutionId: req.user?.institutionId || null,
      action: 'CSRF_TOKEN_GENERATED',
      resource: 'csrf_token',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
      errorMessage: null,
      sensitiveData: false
    }).save().catch(err => console.error('Failed to log CSRF token generation:', err));
    
    res.json({ 
      csrfToken: token,
      expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });
  } catch (error: any) {
    console.error('Error generating CSRF token:', error);
    res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
};

// CSRF token validation for API endpoints
export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  if (!token || !sessionToken) {
    return false;
  }
  
  return securityUtils.verifyCSRFToken(token, sessionToken);
};

// Middleware to refresh CSRF token periodically
export const refreshCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  // Refresh token every 15 minutes or on specific actions
  const lastRefresh = req.session?.csrfTokenRefresh || 0;
  const now = Date.now();
  const refreshInterval = 15 * 60 * 1000; // 15 minutes
  
  if (now - lastRefresh > refreshInterval) {
    req.session!.csrfToken = generateCSRFToken();
    req.session!.csrfTokenRefresh = now;
    res.setHeader('X-CSRF-Token-Refreshed', 'true');
    res.setHeader('X-CSRF-Token', req.session!.csrfToken);
  }
  
  next();
};