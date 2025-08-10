import { Schema, model, Document, Types } from 'mongoose';
import { securityUtils } from '../config/security';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'finance' | 'cashier';
  institutionId: Types.ObjectId;
  status: 'active' | 'suspended' | 'pending_verification' | 'locked' | 'deactivated';
  
  // Security fields
  passwordHistory: string[];
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  lastPasswordChange: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  emailVerified: boolean;
  
  // MFA fields
  mfaEnabled: boolean;
  mfaSecret?: string;
  mfaBackupCodes?: string[];
  mfaLastUsed?: Date;
  
  // Audit fields
  createdBy?: Types.ObjectId;
  lastModifiedBy?: Types.ObjectId;
  loginHistory: {
    timestamp: Date;
    ip: string;
    userAgent: string;
    success: boolean;
    location?: string;
  }[];
  
  // Compliance fields
  consentGiven: boolean;
  consentDate?: Date;
  dataRetentionExpiry?: Date;
  privacyPolicyAccepted: boolean;
  privacyPolicyVersion?: string;
  
  // Profile fields
  photoUrl?: string;
  permanentAddress?: string;
  govtIdUrl?: string;
  qualifications?: string[];
  certifications?: { title: string; fileUrl: string; issueDate: Date }[];
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  isLocked(): boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: true,
      maxlength: 100,
      validate: {
        validator: (v: string) => /^[a-zA-Z\s'-]+$/.test(v),
        message: 'Name contains invalid characters'
      }
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      maxlength: 254,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Invalid email format'
      }
    },
    password: { 
      type: String, 
      required: true,
      minlength: 12,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'parent', 'finance', 'cashier'],
      required: true,
    },
    institutionId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Institution', 
      required: true,
      index: true
    },
    status: { 
      type: String, 
      enum: ['active', 'suspended', 'pending_verification', 'locked', 'deactivated'], 
      default: 'pending_verification',
      index: true
    },
    
    // Security fields
    passwordHistory: [{ 
      type: String, 
      select: false 
    }],
    loginAttempts: { 
      type: Number, 
      default: 0 
    },
    lockUntil: { 
      type: Date,
      index: { expireAfterSeconds: 0 }
    },
    lastLogin: { 
      type: Date,
      index: true
    },
    lastPasswordChange: { 
      type: Date, 
      default: Date.now 
    },
    passwordResetToken: { 
      type: String, 
      select: false 
    },
    passwordResetExpires: { 
      type: Date,
      index: { expireAfterSeconds: 0 }
    },
    emailVerificationToken: { 
      type: String, 
      select: false 
    },
    emailVerificationExpires: { 
      type: Date,
      index: { expireAfterSeconds: 0 }
    },
    emailVerified: { 
      type: Boolean, 
      default: false 
    },
    
    // MFA fields
    mfaEnabled: { 
      type: Boolean, 
      default: false 
    },
    mfaSecret: { 
      type: String, 
      select: false 
    },
    mfaBackupCodes: [{ 
      type: String, 
      select: false 
    }],
    mfaLastUsed: { 
      type: Date 
    },
    
    // Audit fields
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    lastModifiedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    loginHistory: [{
      timestamp: { type: Date, default: Date.now },
      ip: { type: String, required: true },
      userAgent: { type: String },
      success: { type: Boolean, required: true },
      location: { type: String }
    }],
    
    // Compliance fields
    consentGiven: { 
      type: Boolean, 
      default: false 
    },
    consentDate: { 
      type: Date 
    },
    dataRetentionExpiry: { 
      type: Date,
      index: { expireAfterSeconds: 0 }
    },
    privacyPolicyAccepted: { 
      type: Boolean, 
      default: false 
    },
    privacyPolicyVersion: { 
      type: String 
    },
    
    // Profile fields
    photoUrl: { 
      type: String,
      validate: {
        validator: (v: string) => !v || /^https?:\/\/.+/.test(v),
        message: 'Photo URL must be a valid HTTP/HTTPS URL'
      }
    },
    permanentAddress: { 
      type: String,
      maxlength: 500
    },
    govtIdUrl: { 
      type: String,
      validate: {
        validator: (v: string) => !v || /^https?:\/\/.+/.test(v),
        message: 'Government ID URL must be a valid HTTP/HTTPS URL'
      }
    },
    qualifications: [{ 
      type: String,
      maxlength: 200
    }],
    certifications: [{
      title: { 
        type: String, 
        required: true,
        maxlength: 200
      },
      fileUrl: { 
        type: String, 
        required: true,
        validate: {
          validator: (v: string) => /^https?:\/\/.+/.test(v),
          message: 'File URL must be a valid HTTP/HTTPS URL'
        }
      },
      issueDate: { 
        type: Date, 
        required: true 
      }
    }]
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.passwordHistory;
        delete ret.mfaSecret;
        delete ret.mfaBackupCodes;
        delete ret.passwordResetToken;
        delete ret.emailVerificationToken;
        return ret;
      }
    }
  }
);

// Indexes for performance and security
UserSchema.index({ email: 1, institutionId: 1 });
UserSchema.index({ role: 1, institutionId: 1 });
UserSchema.index({ status: 1, institutionId: 1 });
UserSchema.index({ lastLogin: -1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware for password hashing
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const bcrypt = require('bcryptjs');
    const { securityConfig } = require('../config/security');
    
    // Hash the password
    this.password = await bcrypt.hash(this.password, securityConfig.password.bcryptRounds);
    
    // Update password history
    if (!this.passwordHistory) this.passwordHistory = [];
    this.passwordHistory.push(this.password);
    
    // Keep only last 12 passwords
    if (this.passwordHistory.length > securityConfig.password.historyCount) {
      this.passwordHistory = this.passwordHistory.slice(-securityConfig.password.historyCount);
    }
    
    this.lastPasswordChange = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  const { securityConfig } = require('../config/security');
  
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // If we have hit max attempts and it's not locked, lock the account
  if (this.loginAttempts + 1 >= securityConfig.password.maxAttempts && !this.isLocked()) {
    updates.$set = {
      lockUntil: new Date(Date.now() + securityConfig.password.lockoutDuration)
    };
  }
  
  return this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

UserSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Static methods
UserSchema.statics.findByEmail = function(email: string, institutionId: string) {
  return this.findOne({ 
    email: email.toLowerCase(), 
    institutionId: new Types.ObjectId(institutionId) 
  });
};

UserSchema.statics.findActiveUsers = function(institutionId: string) {
  return this.find({ 
    institutionId: new Types.ObjectId(institutionId),
    status: 'active'
  });
};

export default model<IUser>('User', UserSchema);