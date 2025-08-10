// backend/middleware/auditLogger.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Audit log schema
const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: String },
  method: { type: String, required: true },
  url: { type: String, required: true },
  ip: { type: String, required: true },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now },
  success: { type: Boolean, required: true },
  errorMessage: { type: String },
  changes: { type: mongoose.Schema.Types.Mixed },
  sensitiveData: { type: Boolean, default: false }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// Audit logging middleware
export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  const startTime = Date.now();

  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    const success = res.statusCode < 400;

    // Create audit log entry
    const auditEntry = {
      userId: req.user?.id,
      institutionId: req.user?.institutionId,
      action: getActionFromRoute(req.route?.path, req.method),
      resource: getResourceFromPath(req.path),
      resourceId: req.params.id,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      success,
      errorMessage: success ? undefined : getErrorMessage(data),
      changes: req.method !== 'GET' ? sanitizeChanges(req.body) : undefined,
      sensitiveData: isSensitiveRoute(req.path),
      responseTime
    };

    // Save audit log asynchronously
    new AuditLog(auditEntry).save().catch(err => {
      console.error('Failed to save audit log:', err);
    });

    return originalSend.call(this, data);
  };

  next();
};

// Helper functions
function getActionFromRoute(routePath: string, method: string): string {
  const actions: { [key: string]: string } = {
    'POST': 'CREATE',
    'GET': 'READ',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE'
  };
  return actions[method] || 'UNKNOWN';
}

function getResourceFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  return segments[1] || 'unknown';
}

function getErrorMessage(data: any): string | undefined {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed.message || parsed.error || 'Unknown error';
  } catch {
    return 'Parse error';
  }
}

function sanitizeChanges(body: any): any {
  if (!body) return undefined;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

function isSensitiveRoute(path: string): boolean {
  const sensitiveRoutes = ['/auth', '/payment', '/grades', '/monitoring'];
  return sensitiveRoutes.some(route => path.includes(route));
}

// Export audit log model for queries
export { AuditLog };