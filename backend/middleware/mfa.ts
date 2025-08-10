// backend/middleware/mfa.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';

declare global {
  namespace Express {
    interface Request {
      mfaRequired?: boolean;
    }
  }
}

// Generate MFA secret
export const generateMFASecret = (userEmail: string) => {
  return speakeasy.generateSecret({
    name: `EducateNext (${userEmail})`,
    issuer: 'EducateNext',
    length: 32
  });
};

// Generate QR code for MFA setup
export const generateMFAQRCode = async (secret: string): Promise<string> => {
  return await QRCode.toDataURL(secret);
};

// Verify MFA token
export const verifyMFAToken = (token: string, secret: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps (60 seconds) tolerance
  });
};

// MFA middleware
export const requireMFA = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Skip MFA for users who haven't enabled it
    if (!user.mfaEnabled) {
      return next();
    }

    const mfaToken = req.headers['x-mfa-token'] as string;
    if (!mfaToken) {
      return res.status(403).json({ 
        error: 'MFA token required',
        mfaRequired: true 
      });
    }

    const isValid = verifyMFAToken(mfaToken, user.mfaSecret);
    if (!isValid) {
      return res.status(403).json({ error: 'Invalid MFA token' });
    }

    next();
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({ error: 'MFA verification failed' });
  }
};

// Setup MFA endpoint
export const setupMFA = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const secret = generateMFASecret(user.email);
    const qrCode = await generateMFAQRCode(secret.otpauth_url!);

    // Store secret temporarily (not enabled until verified)
    user.mfaSecret = secret.base32;
    user.mfaEnabled = false;
    await user.save();

    res.json({
      secret: secret.base32,
      qrCode,
      manualEntryKey: secret.base32
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({ error: 'Failed to setup MFA' });
  }
};

// Enable MFA endpoint
export const enableMFA = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ error: 'MFA not set up' });
    }

    const isValid = verifyMFAToken(token, user.mfaSecret);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    user.mfaEnabled = true;
    await user.save();

    res.json({ message: 'MFA enabled successfully' });
  } catch (error) {
    console.error('MFA enable error:', error);
    res.status(500).json({ error: 'Failed to enable MFA' });
  }
};

// Disable MFA endpoint
export const disableMFA = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Verify MFA token
    if (user.mfaEnabled && user.mfaSecret) {
      const isTokenValid = verifyMFAToken(token, user.mfaSecret);
      if (!isTokenValid) {
        return res.status(400).json({ error: 'Invalid MFA token' });
      }
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();

    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({ error: 'Failed to disable MFA' });
  }
};