import { Request, Response, NextFunction } from 'express';

// Simple RBAC middleware placeholder
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check user role logic
    next();
  };
}