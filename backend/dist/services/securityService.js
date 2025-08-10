"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityService = exports.SecurityService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const analyticsService_1 = require("./analyticsService");
class SecurityService {
    constructor() {
        this.suspiciousActivities = new Map();
        this.blockedIPs = new Set();
    }
    static getInstance() {
        if (!SecurityService.instance) {
            SecurityService.instance = new SecurityService();
        }
        return SecurityService.instance;
    }
    // Password security
    async hashPassword(password) {
        const saltRounds = 12;
        return bcryptjs_1.default.hash(password, saltRounds);
    }
    async verifyPassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    validatePasswordStrength(password) {
        const feedback = [];
        let score = 0;
        if (password.length >= 8)
            score += 1;
        else
            feedback.push('Password must be at least 8 characters long');
        if (/[a-z]/.test(password))
            score += 1;
        else
            feedback.push('Password must contain lowercase letters');
        if (/[A-Z]/.test(password))
            score += 1;
        else
            feedback.push('Password must contain uppercase letters');
        if (/\d/.test(password))
            score += 1;
        else
            feedback.push('Password must contain numbers');
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password))
            score += 1;
        else
            feedback.push('Password must contain special characters');
        return {
            isValid: score >= 4,
            score,
            feedback
        };
    }
    // JWT security
    generateSecureToken(payload, expiresIn = '24h') {
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        return jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn: expiresIn,
            issuer: 'educatenext',
            audience: 'educatenext-users'
        });
    }
    verifyToken(token) {
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        return jsonwebtoken_1.default.verify(token, secret);
    }
    // Data encryption
    encrypt(text, key) {
        const algorithm = 'aes-256-cbc';
        const secretKey = key || process.env.ENCRYPTION_KEY || 'default-encryption-key';
        const keyHash = crypto_1.default.createHash('sha256').update(secretKey).digest();
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipher(algorithm, keyHash);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return {
            encrypted,
            iv: iv.toString('hex')
        };
    }
    decrypt(encryptedData, key) {
        const algorithm = 'aes-256-cbc';
        const secretKey = key || process.env.ENCRYPTION_KEY || 'default-encryption-key';
        const keyHash = crypto_1.default.createHash('sha256').update(secretKey).digest();
        const decipher = crypto_1.default.createDecipher(algorithm, keyHash);
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    // Input sanitization
    sanitizeInput(input) {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Intrusion detection
    detectSuspiciousActivity(userId, activity, metadata = {}) {
        const key = `${userId}:${activity}`;
        const count = this.suspiciousActivities.get(key) || 0;
        const newCount = count + 1;
        this.suspiciousActivities.set(key, newCount);
        // Define thresholds for different activities
        const thresholds = {
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
    async handleSuspiciousActivity(userId, activity, count, metadata) {
        // Create security alert
        await (0, analyticsService_1.createAlert)(metadata.institutionId, 'security', 'high', 'Suspicious Activity Detected', `User ${userId} has performed ${activity} ${count} times`, { userId, activity, count, metadata });
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
    blockIP(ip) {
        this.blockedIPs.add(ip);
        console.warn(`IP ${ip} has been blocked due to suspicious activity`);
    }
    isIPBlocked(ip) {
        return this.blockedIPs.has(ip);
    }
    // Session security
    generateSessionId() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    validateSession(sessionId, userId) {
        // Implement session validation logic
        // This would typically check against a session store
        return sessionId.length === 64 && /^[a-f0-9]+$/.test(sessionId);
    }
    // CSRF protection
    generateCSRFToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    validateCSRFToken(token, sessionToken) {
        return token === sessionToken && token.length === 64;
    }
    // Audit logging
    logSecurityEvent(event) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...event
        };
        // In production, this would write to a secure audit log
        console.log('Security Event:', JSON.stringify(logEntry));
    }
    // Data masking for sensitive information
    maskSensitiveData(data, fields = ['password', 'ssn', 'creditCard']) {
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
    cleanup() {
        // Clear old suspicious activity records (older than 1 hour)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        // This is a simplified cleanup - in production, you'd want more sophisticated logic
        this.suspiciousActivities.clear();
        console.log('Security service cleanup completed');
    }
}
exports.SecurityService = SecurityService;
exports.securityService = SecurityService.getInstance();
