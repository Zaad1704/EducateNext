import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createAlert } from './analyticsService';

export class SecurityService {
  private static instance: SecurityService;
  private suspiciousActivities = new Map<string, number>();
  private blockedIPs = new Set<string>();

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Password security
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Password must be at least 8 characters long');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Password must contain lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Password must contain uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Password must contain numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Password must contain special characters');

    return {
      isValid: score >= 4,
      score,
      feedback
    };
  }

  // JWT security
  generateSecureToken(payload: any, expiresIn: string = '24h'): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    return jwt.sign(payload, secret, { 
      expiresIn: expiresIn as any,
      issuer: 'educatenext',
      audience: 'educatenext-users'
    });
  }

  verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    return jwt.verify(token, secret);
  }

  // Data encryption
  encrypt(text: string, key?: string): { encrypted: string; iv: string } {
    const algorithm = 'aes-256-cbc';
    const secretKey = key || process.env.ENCRYPTION_KEY || 'default-encryption-key';
    const keyHash = crypto.createHash('sha256').update(secretKey).digest();
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, keyHash);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  decrypt(encryptedData: { encrypted: string; iv: string }, key?: string): string {
    const algorithm = 'aes-256-cbc';
    const secretKey = key || process.env.ENCRYPTION_KEY || 'default-encryption-key';
    const keyHash = crypto.createHash('sha256').update(secretKey).digest();
    
    const decipher = crypto.createDecipher(algorithm, keyHash);
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Intrusion detection
  detectSuspiciousActivity(
    userId: string,
    activity: string,
    metadata: any = {}
  ): boolean {
    const key = `${userId}:${activity}`;
    const count = this.suspiciousActivities.get(key) || 0;
    const newCount = count + 1;
    
    this.suspiciousActivities.set(key, newCount);

    // Define thresholds for different activities
    const thresholds: { [key: string]: number } = {
      'failed_login': 5,
      'rapid_requests': 100,
      'data_access': 50,
      'permission_denied': 10
    };

    const threshold = thresholds[activity] || 20;

    if (newCount >= threshold) {
      this.handleSuspiciousActivity(userId, activity, newCount, metadata);
      return true;
    }

    return false;
  }

  private async handleSuspiciousActivity(
    userId: string,
    activity: string,
    count: number,
    metadata: any
  ): Promise<void> {
    // Create security alert
    await createAlert(
      metadata.institutionId,
      'security',
      'high',
      'Suspicious Activity Detected',
      `User ${userId} has performed ${activity} ${count} times`,
      { userId, activity, count, metadata }
    );

    // Log security event
    console.warn(`Security Alert: User ${userId} - ${activity} (${count} times)`);

    // Additional actions based on activity type
    switch (activity) {
      case 'failed_login':
        if (count >= 10) {
          this.blockIP(metadata.ip);
        }
        break;
      case 'rapid_requests':
        // Implement temporary rate limiting
        break;
    }
  }

  blockIP(ip: string): void {
    this.blockedIPs.add(ip);
    console.warn(`IP ${ip} has been blocked due to suspicious activity`);
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // Session security
  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  validateSession(sessionId: string, userId: string): boolean {
    // Implement session validation logic
    // This would typically check against a session store
    return sessionId.length === 64 && /^[a-f0-9]+$/.test(sessionId);
  }

  // CSRF protection
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken && token.length === 64;
  }

  // Audit logging
  logSecurityEvent(event: {
    type: 'login' | 'logout' | 'access' | 'modification' | 'error';
    userId: string;
    ip: string;
    userAgent: string;
    resource?: string;
    action?: string;
    success: boolean;
    metadata?: any;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event
    };

    // In production, this would write to a secure audit log
    console.log('Security Event:', JSON.stringify(logEntry));
  }

  // Data masking for sensitive information
  maskSensitiveData(data: any, fields: string[] = ['password', 'ssn', 'creditCard']): any {
    const masked = { ...data };
    
    fields.forEach(field => {
      if (masked[field]) {
        const value = masked[field].toString();
        masked[field] = '*'.repeat(value.length - 4) + value.slice(-4);
      }
    });

    return masked;
  }

  // Clean up expired security data
  cleanup(): void {
    // Clear old suspicious activity records (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // This is a simplified cleanup - in production, you'd want more sophisticated logic
    this.suspiciousActivities.clear();
    
    console.log('Security service cleanup completed');
  }
}

export const securityService = SecurityService.getInstance();