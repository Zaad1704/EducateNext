// backend/config/security.ts
import crypto from 'crypto';

export const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || generateSecureSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    issuer: 'educatenext',
    audience: 'educatenext-users',
    algorithm: 'HS256' as const
  },

  // Password Configuration
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12')
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'),
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || generateSecureSecret(),
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '3600000'), // 1 hour
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const
  },

  // File Upload Configuration
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-csrf-token']
  },

  // Security Headers
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    }
  },

  // Audit Logging Configuration
  audit: {
    enabled: process.env.ENABLE_AUDIT_LOGGING === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
    retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '365'),
    sensitiveFields: ['password', 'token', 'secret', 'key', 'authorization']
  },

  // Database Security
  database: {
    connectionTimeout: 30000,
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000
  },

  // Encryption Configuration
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16
  }
};

// Generate secure random secret if not provided
function generateSecureSecret(): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET and SESSION_SECRET must be set in production');
  }
  return crypto.randomBytes(64).toString('hex');
}

// Validate security configuration
export function validateSecurityConfig(): void {
  const errors: string[] = [];

  // Check JWT secret
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    errors.push('JWT_SECRET must be set in production');
  }

  // Check session secret
  if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
    errors.push('SESSION_SECRET must be set in production');
  }

  // Check database URI
  if (!process.env.MONGODB_URI) {
    errors.push('MONGODB_URI must be set');
  }

  if (errors.length > 0) {
    throw new Error(`Security configuration errors:\n${errors.join('\n')}`);
  }
}

// Security utilities
export const securityUtils = {
  // Generate secure random string
  generateSecureToken: (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Hash sensitive data
  hashData: (data: string): string => {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  // Encrypt sensitive data
  encrypt: (text: string, key: string): { encrypted: string; iv: string; tag: string } => {
    const iv = crypto.randomBytes(securityConfig.encryption.ivLength);
    const cipher = crypto.createCipher(securityConfig.encryption.algorithm, key);
    cipher.setAAD(Buffer.from('educatenext'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  },

  // Decrypt sensitive data
  decrypt: (encryptedData: { encrypted: string; iv: string; tag: string }, key: string): string => {
    const decipher = crypto.createDecipher(securityConfig.encryption.algorithm, key);
    decipher.setAAD(Buffer.from('educatenext'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  },

  // Sanitize user input
  sanitizeInput: (input: any): any => {
    if (typeof input === 'string') {
      return input.replace(/[<>]/g, '').trim();
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const key in input) {
        sanitized[key] = securityUtils.sanitizeInput(input[key]);
      }
      return sanitized;
    }
    return input;
  }
};