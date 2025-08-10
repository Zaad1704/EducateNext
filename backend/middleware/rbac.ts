// backend/middleware/rbac.ts
import { Request, Response, NextFunction } from 'express';

// Simple RBAC middleware
export function authorize(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if req.user exists (meaning authMiddleware has run)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' }); // Should ideally be caught by authMiddleware first
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    // Check if the user's role is included in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}.` });
    }

    next(); // User is authorized, proceed to the next middleware/controller
  };
}

// Alias for backward compatibility
export const checkRole = authorize;
