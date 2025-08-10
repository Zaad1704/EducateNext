// backend/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import Institution from '../models/Institution';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import { securityConfig, securityUtils } from '../config/security';
import { AuditLog } from '../middleware/auditLogger';

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role, institutionId } = req.body;
  const clientIp = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    // Enhanced validation
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      await new AuditLog({
        userId: null,
        action: 'REGISTRATION_VALIDATION_FAILED',
        resource: 'user_registration',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Registration validation failed',
        sensitiveData: false,
        metadata: { errors: validationErrors.array() }
      }).save().catch(err => console.error('Failed to log validation error:', err));
      
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors.array()
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await new AuditLog({
        userId: null,
        action: 'REGISTRATION_DUPLICATE_EMAIL',
        resource: 'user_registration',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Registration attempt with existing email',
        sensitiveData: true,
        metadata: { email: email.toLowerCase() }
      }).save().catch(err => console.error('Failed to log duplicate email:', err));
      
      return res.status(409).json({ message: 'User with that email already exists' });
    }

    // Validate institution
    if (!Types.ObjectId.isValid(institutionId)) {
      return res.status(400).json({ message: 'Invalid institution ID format' });
    }
    
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    // Enhanced password hashing
    const hashedPassword = await bcrypt.hash(password, securityConfig.password.bcryptRounds);

    // Create new user with enhanced security
    const user = new User({
      name: securityUtils.sanitizeInput(name),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      institutionId: new Types.ObjectId(institutionId),
      status: 'pending_verification', // Require email verification
      emailVerificationToken: securityUtils.generateSecureToken(),
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      passwordHistory: [hashedPassword],
      loginAttempts: 0,
      lockUntil: undefined,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();

    // Log successful registration
    await new AuditLog({
      userId: user._id.toString(),
      institutionId: institutionId,
      action: 'USER_REGISTERED',
      resource: 'user_registration',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: true,
      errorMessage: null,
      sensitiveData: false,
      metadata: {
        role,
        institutionName: institution.name
      }
    }).save().catch(err => console.error('Failed to log registration:', err));

    // Generate tokens
    const payload = {
      user: {
        id: user._id,
        role: user.role,
        institutionId: user.institutionId,
        email: user.email,
        name: user.name
      }
    };

    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!jwtSecret || !refreshSecret) {
      console.error('JWT secrets not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: securityConfig.jwt.expiresIn,
      issuer: securityConfig.jwt.issuer,
      audience: securityConfig.jwt.audience,
      algorithm: securityConfig.jwt.algorithm
    });

    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: securityConfig.jwt.refreshExpiresIn,
      issuer: securityConfig.jwt.issuer,
      audience: securityConfig.jwt.audience,
      algorithm: securityConfig.jwt.algorithm
    });

    // Set secure cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
        status: user.status
      }
    });

  } catch (error: any) {
    console.error('Error during user registration:', error);
    
    await new AuditLog({
      userId: null,
      action: 'REGISTRATION_ERROR',
      resource: 'user_registration',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: false,
      errorMessage: error.message,
      sensitiveData: false
    }).save().catch(err => console.error('Failed to log registration error:', err));
    
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const clientIp = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    // Enhanced validation
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors.array()
      });
    }

    // Find user with case-insensitive email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      await new AuditLog({
        userId: null,
        action: 'LOGIN_FAILED_USER_NOT_FOUND',
        resource: 'authentication',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Login attempt with non-existent email',
        sensitiveData: true,
        metadata: { email: email.toLowerCase() }
      }).save().catch(err => console.error('Failed to log login attempt:', err));
      
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      await new AuditLog({
        userId: user._id.toString(),
        institutionId: user.institutionId.toString(),
        action: 'LOGIN_FAILED_ACCOUNT_LOCKED',
        resource: 'authentication',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: 'Login attempt on locked account',
        sensitiveData: true
      }).save().catch(err => console.error('Failed to log locked account attempt:', err));
      
      return res.status(423).json({ 
        message: 'Account is temporarily locked due to too many failed login attempts',
        lockUntil: user.lockUntil
      });
    }

    // Check account status
    if (user.status !== 'active') {
      await new AuditLog({
        userId: user._id.toString(),
        institutionId: user.institutionId.toString(),
        action: 'LOGIN_FAILED_INACTIVE_ACCOUNT',
        resource: 'authentication',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: `Login attempt on ${user.status} account`,
        sensitiveData: true
      }).save().catch(err => console.error('Failed to log inactive account attempt:', err));
      
      return res.status(403).json({ 
        message: `Account is ${user.status}. Please contact administrator.`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account if too many attempts
      if (user.loginAttempts >= securityConfig.password.maxAttempts) {
        user.lockUntil = new Date(Date.now() + securityConfig.password.lockoutDuration);
      }
      
      await user.save();
      
      await new AuditLog({
        userId: user._id.toString(),
        institutionId: user.institutionId.toString(),
        action: 'LOGIN_FAILED_INVALID_PASSWORD',
        resource: 'authentication',
        method: req.method,
        url: req.originalUrl,
        ip: clientIp,
        userAgent,
        success: false,
        errorMessage: `Invalid password attempt ${user.loginAttempts}/${securityConfig.password.maxAttempts}`,
        sensitiveData: true
      }).save().catch(err => console.error('Failed to log invalid password:', err));
      
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate CSRF token
    const csrfToken = securityUtils.generateCSRFToken();
    req.session!.csrfToken = csrfToken;

    // Create JWT payload
    const payload = {
      user: {
        id: user._id,
        role: user.role,
        institutionId: user.institutionId,
        email: user.email,
        name: user.name
      }
    };

    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!jwtSecret || !refreshSecret) {
      console.error('JWT secrets not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Generate tokens
    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: securityConfig.jwt.expiresIn,
      issuer: securityConfig.jwt.issuer,
      audience: securityConfig.jwt.audience,
      algorithm: securityConfig.jwt.algorithm
    });

    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: securityConfig.jwt.refreshExpiresIn,
      issuer: securityConfig.jwt.issuer,
      audience: securityConfig.jwt.audience,
      algorithm: securityConfig.jwt.algorithm
    });

    // Set secure cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Log successful login
    await new AuditLog({
      userId: user._id.toString(),
      institutionId: user.institutionId.toString(),
      action: 'LOGIN_SUCCESS',
      resource: 'authentication',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: true,
      errorMessage: null,
      sensitiveData: false
    }).save().catch(err => console.error('Failed to log successful login:', err));

    return res.json({
      message: 'Logged in successfully',
      accessToken,
      csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
        lastLogin: user.lastLogin
      }
    });

  } catch (error: any) {
    console.error('Error during user login:', error);
    
    await new AuditLog({
      userId: null,
      action: 'LOGIN_ERROR',
      resource: 'authentication',
      method: req.method,
      url: req.originalUrl,
      ip: clientIp,
      userAgent,
      success: false,
      errorMessage: error.message,
      sensitiveData: false
    }).save().catch(err => console.error('Failed to log login error:', err));
    
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Logout endpoint
export const logoutUser = async (req: Request, res: Response) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    // Destroy session
    req.session?.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
    });

    // Log logout
    await new AuditLog({
      userId: req.user?.id || null,
      institutionId: req.user?.institutionId || null,
      action: 'LOGOUT_SUCCESS',
      resource: 'authentication',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
      errorMessage: null,
      sensitiveData: false
    }).save().catch(err => console.error('Failed to log logout:', err));

    return res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Error during logout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Refresh token endpoint
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(refreshToken, refreshSecret) as any;
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const payload = {
      user: {
        id: user._id,
        role: user.role,
        institutionId: user.institutionId,
        email: user.email,
        name: user.name
      }
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: securityConfig.jwt.expiresIn,
      issuer: securityConfig.jwt.issuer,
      audience: securityConfig.jwt.audience,
      algorithm: securityConfig.jwt.algorithm
    });

    return res.json({ accessToken });
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};
