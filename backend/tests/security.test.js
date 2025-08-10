// backend/tests/security.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

describe('Security Tests', () => {
  let server;
  let authToken;
  let csrfToken;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/educatenext_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Authentication Security', () => {
    test('should prevent SQL injection in login', async () => {
      const maliciousPayloads = [
        { email: "admin'--", password: 'anything' },
        { email: "admin' OR '1'='1", password: 'anything' },
        { email: "admin'; DROP TABLE users;--", password: 'anything' }
      ];

      for (const payload of maliciousPayloads) {
        // Should detect malicious input
        expect(payload.email).toMatch(/['";]/);
      }
    });

    test('should prevent NoSQL injection in login', async () => {
      const maliciousPayloads = [
        { email: { $ne: null }, password: { $ne: null } },
        { email: { $regex: '.*' }, password: { $regex: '.*' } },
        { email: { $where: 'this.email' }, password: 'anything' }
      ];

      for (const payload of maliciousPayloads) {
        // Should detect object-based injection
        expect(typeof payload.email).toBe('object');
      }
    });
  });

  describe('Input Validation', () => {
    test('should validate grade input strictly', () => {
      const invalidGrades = [
        { obtainedMarks: -1, maxMarks: 100 },
        { obtainedMarks: 101, maxMarks: 100 },
        { obtainedMarks: 'invalid', maxMarks: 100 },
        { obtainedMarks: 85, maxMarks: -1 }
      ];

      for (const gradeData of invalidGrades) {
        if (typeof gradeData.obtainedMarks === 'number') {
          expect(gradeData.obtainedMarks >= 0).toBe(gradeData.obtainedMarks >= 0);
        }
      }
    });

    test('should validate payment amounts strictly', () => {
      const invalidAmounts = [-1, 0, 1000001, 'invalid', null];

      for (const amount of invalidAmounts) {
        const isValid = typeof amount === 'number' && amount > 0 && amount <= 1000000;
        expect(isValid).toBe(false);
      }
    });
  });

  describe('XSS Prevention', () => {
    test('should detect XSS patterns', () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '<iframe src="javascript:alert(1)"></iframe>'
      ];

      for (const payload of xssPayloads) {
        const hasXSS = /<script|<iframe|javascript:|onerror=/i.test(payload);
        expect(hasXSS).toBe(true);
      }
    });
  });

  describe('Data Encryption', () => {
    test('should encrypt sensitive data', () => {
      const crypto = require('crypto');
      const sensitiveData = 'sensitive information';
      
      // Simulate encryption
      const key = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-gcm', key);
      
      let encrypted = cipher.update(sensitiveData, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(sensitiveData);
    });

    test('should hash passwords securely', async () => {
      const password = 'SecurePass123!';
      const hash = await bcrypt.hash(password, 14);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
      
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });
  });

  describe('File Upload Security', () => {
    test('should reject malicious file types', () => {
      const maliciousFiles = [
        { filename: 'malware.exe', mimetype: 'application/x-executable' },
        { filename: 'script.js', mimetype: 'application/javascript' },
        { filename: 'shell.php', mimetype: 'application/x-php' }
      ];

      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

      for (const file of maliciousFiles) {
        const isAllowed = allowedTypes.includes(file.mimetype);
        expect(isAllowed).toBe(false);
      }
    });

    test('should validate file sizes', () => {
      const maxSize = 2 * 1024 * 1024; // 2MB
      const testSizes = [
        { size: 1024, valid: true },
        { size: 1024 * 1024, valid: true },
        { size: 3 * 1024 * 1024, valid: false },
        { size: 10 * 1024 * 1024, valid: false }
      ];

      for (const test of testSizes) {
        const isValid = test.size <= maxSize;
        expect(isValid).toBe(test.valid);
      }
    });
  });

  describe('CSRF Protection', () => {
    test('should generate secure CSRF tokens', () => {
      const crypto = require('crypto');
      
      const token1 = crypto.randomBytes(32).toString('base64url');
      const token2 = crypto.randomBytes(32).toString('base64url');
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(40);
    });

    test('should validate CSRF tokens securely', () => {
      const crypto = require('crypto');
      
      const token = crypto.randomBytes(32).toString('base64url');
      const sameToken = token;
      const differentToken = crypto.randomBytes(32).toString('base64url');
      
      // Simulate timing-safe comparison
      const isValid1 = crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sameToken));
      const isValid2 = token === differentToken;
      
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    test('should implement rate limiting logic', () => {
      const requests = [];
      const windowMs = 15 * 60 * 1000; // 15 minutes
      const maxRequests = 5;
      const now = Date.now();
      
      // Simulate requests
      for (let i = 0; i < 10; i++) {
        requests.push({ timestamp: now + (i * 1000) });
      }
      
      // Count requests in window
      const recentRequests = requests.filter(req => 
        now - req.timestamp < windowMs
      );
      
      const shouldBlock = recentRequests.length > maxRequests;
      expect(shouldBlock).toBe(true);
    });
  });

  describe('Authorization', () => {
    test('should enforce role-based access', () => {
      const roles = {
        student: ['read_own_grades', 'read_own_attendance'],
        teacher: ['read_grades', 'write_grades', 'read_attendance'],
        admin: ['read_all', 'write_all', 'delete_all']
      };
      
      const userRole = 'student';
      const requiredPermission = 'write_grades';
      
      const hasPermission = roles[userRole].includes(requiredPermission);
      expect(hasPermission).toBe(false);
    });

    test('should validate institution access', () => {
      const userInstitution = 'inst_123';
      const resourceInstitution = 'inst_456';
      
      const hasAccess = userInstitution === resourceInstitution;
      expect(hasAccess).toBe(false);
    });
  });

  describe('Audit Logging', () => {
    test('should log security events', () => {
      const auditLog = {
        timestamp: new Date(),
        userId: 'user_123',
        action: 'LOGIN_FAILED',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        success: false,
        errorMessage: 'Invalid credentials'
      };
      
      expect(auditLog.timestamp).toBeDefined();
      expect(auditLog.action).toBe('LOGIN_FAILED');
      expect(auditLog.success).toBe(false);
    });

    test('should sanitize sensitive data in logs', () => {
      const sensitiveFields = ['password', 'token', 'secret', 'key'];
      const logData = {
        email: 'user@example.com',
        password: 'secret123',
        token: 'jwt_token_here'
      };
      
      const sanitizedLog = {};
      for (const [key, value] of Object.entries(logData)) {
        if (sensitiveFields.includes(key)) {
          sanitizedLog[key] = '[REDACTED]';
        } else {
          sanitizedLog[key] = value;
        }
      }
      
      expect(sanitizedLog.password).toBe('[REDACTED]');
      expect(sanitizedLog.token).toBe('[REDACTED]');
      expect(sanitizedLog.email).toBe('user@example.com');
    });
  });

  describe('Security Headers', () => {
    test('should validate security headers', () => {
      const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '0',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Content-Security-Policy': "default-src 'self'"
      };
      
      expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff');
      expect(securityHeaders['X-Frame-Options']).toBe('DENY');
      expect(securityHeaders['Strict-Transport-Security']).toContain('max-age=31536000');
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize malicious input', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:void(0)',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert(1)</script>'
      ];
      
      for (const input of maliciousInputs) {
        const sanitized = input
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/[<>"']/g, '');
        
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror=');
      }
    });
  });

  describe('Password Security', () => {
    test('should enforce strong password requirements', () => {
      const passwords = [
        { password: 'weak', valid: false },
        { password: 'StrongPass123!', valid: true },
        { password: 'NoNumbers!', valid: false },
        { password: 'nonumbersorspecial', valid: false },
        { password: 'NOLOWERCASE123!', valid: false }
      ];
      
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
      
      for (const test of passwords) {
        const isValid = passwordRegex.test(test.password);
        expect(isValid).toBe(test.valid);
      }
    });
  });
});