import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Standardized error response interface
export interface APIError {
  error: string;
  code: string;
  timestamp: string;
  requestId: string;
  details?: any;
}

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Get HTTP status code from error
const getStatusCode = (error: Error): number => {
  switch (error.name) {
    case 'ValidationError':
      return 400;
    case 'AuthenticationError':
      return 401;
    case 'AuthorizationError':
      return 403;
    case 'NotFoundError':
      return 404;
    case 'ConflictError':
      return 409;
    case 'RateLimitError':
      return 429;
    case 'MongoError':
    case 'MongooseError':
      return 500;
    default:
      return 500;
  }
};

// Generate request ID
const generateRequestId = (): string => {
  return uuidv4();
};

// Main error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  const statusCode = getStatusCode(err);
  
  // Create standardized error response
  const errorResponse: APIError = {
    error: process.env.NODE_ENV === 'production' 
      ? getProductionErrorMessage(err) 
      : err.message,
    code: err.name || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
    requestId
  };

  // Add validation details for ValidationError
  if (err instanceof ValidationError && err.field) {
    errorResponse.details = { field: err.field };
  }

  // Log error with context
  logger.error('API Error', {
    ...errorResponse,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    userId: req.user?.id
  });

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Get production-safe error messages
const getProductionErrorMessage = (error: Error): string => {
  switch (error.name) {
    case 'ValidationError':
      return 'Invalid input data';
    case 'AuthenticationError':
      return 'Authentication required';
    case 'AuthorizationError':
      return 'Access denied';
    case 'NotFoundError':
      return 'Resource not found';
    case 'ConflictError':
      return 'Resource conflict';
    case 'RateLimitError':
      return 'Too many requests';
    case 'MongoError':
    case 'MongooseError':
      return 'Database error';
    default:
      return 'Internal server error';
  }
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// Unhandled promise rejection handler
export const handleUnhandledRejection = (): void => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection:', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString()
    });
    
    // Graceful shutdown in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
};

// Uncaught exception handler
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack
    });
    
    // Graceful shutdown
    process.exit(1);
  });
};