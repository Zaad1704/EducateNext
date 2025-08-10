// backend/config/security.ts
import crypto from 'crypto';

export const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || generateSecureSecret(),
    refreshSecret: process.env.JWT_REFRESH_SECRET || generateSecureSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'educatenext',
    audience: 'educatenext-users',
    algorithm: 'HS256' as const
  },

  // Password Configuration
  password: {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '14'),
    maxAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    historyCount: 12 // Remember last 12 passwords
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '50'),
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '3'),
    paymentMaxRequests: parseInt(process.env.PAYMENT_RATE_LIMIT_MAX || '5'),
    gradeMaxRequests: parseInt(process.env.GRADE_RATE_LIMIT_MAX || '10'),
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || generateSecureSecret(),
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '900000'), // 15 minutes
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    rolling: true,
    regenerateOnAuth: true
  },

  // File Upload Configuration
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '2097152'), // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    virusScanEnabled: process.env.VIRUS_SCAN_ENABLED === 'true',
    quarantinePath: process.env.QUARANTINE_PATH || './quarantine'
  },

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'x-csrf-token', 'x-request-id'],
    maxAge: 86400 // 24 hours
  },

  // Security Headers
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
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
    enabled: true,
    logLevel: process.env.LOG_LEVEL || 'info',
    retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '2555'), // 7 years for FERPA
    sensitiveFields: ['password', 'token', 'secret', 'key', 'authorization', 'ssn', 'creditCard'],
    encryptLogs: true,
    realTimeAlerts: true
  },

  // Database Security
  database: {
    connectionTimeout: 30000,
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    ssl: process.env.NODE_ENV === 'production',
    authSource: 'admin'
  },

  // Encryption Configuration
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    keyDerivationIterations: 100000
  },

  // Input Validation
  validation: {
    maxInputLength: 1000,
    allowedCharsets: /^[\w\s\-\.@#$%&*()+={}\[\]:;"'<>,?/|\\~`!^]+$/,
    sqlInjectionPatterns: [
      /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i,
      /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i
    ],
    nosqlInjectionPatterns: [
      /\$where/i, /\$ne/i, /\$gt/i, /\$lt/i, /\$regex/i, /\$or/i, /\$and/i,
      /\$in/i, /\$nin/i, /\$exists/i, /\$type/i, /\$mod/i, /\$all/i
    ],
    xssPatterns: [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ]
  },

  // Compliance Configuration
  compliance: {
    gdpr: {
      enabled: true,
      dataRetentionDays: 2555, // 7 years
      consentRequired: true,
      rightToErasure: true,
      dataPortability: true
    },
    ferpa: {
      enabled: true,
      educationalRecordsProtection: true,
      parentalConsent: true,
      directoryInformation: false
    },
    coppa: {
      enabled: true,
      ageVerification: true,
      parentalConsent: true,
      dataMinimization: true
    }
  },

  // Multi-Factor Authentication
  mfa: {
    enabled: process.env.MFA_ENABLED === 'true',
    methods: ['totp', 'sms', 'email'],
    backupCodes: 10,
    gracePeriod: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};

// Generate secure random secret if not provided
function generateSecureSecret(): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET, JWT_REFRESH_SECRET, and SESSION_SECRET must be set in production');
  }
  return crypto.randomBytes(64).toString('hex');
}

// Validate security configuration
export function validateSecurityConfig(): void {
  const errors: string[] = [];

  // Check JWT secrets
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    errors.push('JWT_SECRET must be set in production');
  }
  if (!process.env.JWT_REFRESH_SECRET && process.env.NODE_ENV === 'production') {
    errors.push('JWT_REFRESH_SECRET must be set in production');
  }

  // Check session secret
  if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
    errors.push('SESSION_SECRET must be set in production');
  }

  // Check database URI
  if (!process.env.MONGODB_URI) {
    errors.push('MONGODB_URI must be set');
  }

  // Check encryption key
  if (!process.env.ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
    errors.push('ENCRYPTION_KEY must be set in production');
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

  // Generate cryptographically secure password
  generateSecurePassword: (length: number = 16): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    return password;
  },

  // Hash sensitive data with salt
  hashData: (data: string, salt?: string): { hash: string; salt: string } => {
    const usedSalt = salt || crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(data, usedSalt, securityConfig.encryption.keyDerivationIterations, 64, 'sha512').toString('hex');
    return { hash, salt: usedSalt };
  },

  // Encrypt sensitive data with proper key derivation
  encrypt: (text: string, masterKey?: string): { encrypted: string; iv: string; tag: string; salt: string } => {
    const salt = crypto.randomBytes(32);
    const key = masterKey ? 
      crypto.pbkdf2Sync(masterKey, salt, securityConfig.encryption.keyDerivationIterations, securityConfig.encryption.keyLength, 'sha512') :
      crypto.pbkdf2Sync(process.env.ENCRYPTION_KEY || 'default-key', salt, securityConfig.encryption.keyDerivationIterations, securityConfig.encryption.keyLength, 'sha512');
    
    const iv = crypto.randomBytes(securityConfig.encryption.ivLength);
    const cipher = crypto.createCipherGCM(securityConfig.encryption.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex')
    };
  },

  // Decrypt sensitive data
  decrypt: (encryptedData: { encrypted: string; iv: string; tag: string; salt: string }, masterKey?: string): string => {
    const key = masterKey ?
      crypto.pbkdf2Sync(masterKey, Buffer.from(encryptedData.salt, 'hex'), securityConfig.encryption.keyDerivationIterations, securityConfig.encryption.keyLength, 'sha512') :
      crypto.pbkdf2Sync(process.env.ENCRYPTION_KEY || 'default-key', Buffer.from(encryptedData.salt, 'hex'), securityConfig.encryption.keyDerivationIterations, securityConfig.encryption.keyLength, 'sha512');
    
    const decipher = crypto.createDecipherGCM(securityConfig.encryption.algorithm, key, Buffer.from(encryptedData.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  },

  // Advanced input sanitization
  sanitizeInput: (input: any): any => {
    if (typeof input === 'string') {
      // Remove potential XSS vectors
      let sanitized = input
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/[<>"']/g, '')
        .trim();
      
      // Limit length
      if (sanitized.length > securityConfig.validation.maxInputLength) {
        sanitized = sanitized.substring(0, securityConfig.validation.maxInputLength);
      }
      
      return sanitized;
    }
    
    if (Array.isArray(input)) {
      return input.map(item => securityUtils.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const key in input) {
        if (input.hasOwnProperty(key)) {
          sanitized[securityUtils.sanitizeInput(key)] = securityUtils.sanitizeInput(input[key]);
        }
      }
      return sanitized;
    }
    
    return input;
  },

  // Validate input against injection patterns
  validateInput: (input: string): { isValid: boolean; threats: string[] } => {
    const threats: string[] = [];
    
    // Check for SQL injection
    securityConfig.validation.sqlInjectionPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('SQL_INJECTION');
      }
    });
    
    // Check for NoSQL injection
    securityConfig.validation.nosqlInjectionPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('NOSQL_INJECTION');
      }
    });
    
    // Check for XSS
    securityConfig.validation.xssPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('XSS');
      }
    });
    
    return {
      isValid: threats.length === 0,
      threats
    };
  },

  // Generate CSRF token
  generateCSRFToken: (): string => {
    return crypto.randomBytes(32).toString('base64url');
  },

  // Verify CSRF token
  verifyCSRFToken: (token: string, sessionToken: string): boolean => {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
  },

  // Rate limiting key generator
  generateRateLimitKey: (ip: string, userId?: string, action?: string): string => {
    const components = [ip];
    if (userId) components.push(userId);
    if (action) components.push(action);
    return crypto.createHash('sha256').update(components.join(':')).digest('hex');
  }
};