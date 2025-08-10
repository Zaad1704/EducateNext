// backend/middleware/csrf.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      csrfToken?: () => string;
    }
  }
}

// Generate CSRF token
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for auth endpoints (they use different protection)
  if (req.path.includes('/auth/')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// Generate and set CSRF token in session
export const setCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.csrfToken) {
    req.session!.csrfToken = generateCSRFToken();
  }

  req.csrfToken = () => req.session!.csrfToken;
  next();
};

// CSRF token endpoint
export const getCSRFToken = (req: Request, res: Response) => {
  const token = req.session?.csrfToken || generateCSRFToken();
  req.session!.csrfToken = token;
  
  res.json({ csrfToken: token });
};