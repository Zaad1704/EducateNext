import Consent from '../models/Consent';
import DataRequest from '../models/DataRequest';
import EducationalRecord from '../models/EducationalRecord';
import User from '../models/User';
import Student from '../models/Student';
import { logger } from '../utils/logger';

export class ComplianceService {
  // GDPR: Record consent
  static async recordConsent(data: {
    userId: string;
    institutionId: string;
    consentType: string;
    granted: boolean;
    ipAddress: string;
    userAgent: string;
  }) {
    const consent = new Consent({
      ...data,
      grantedAt: data.granted ? new Date() : undefined,
      revokedAt: !data.granted ? new Date() : undefined
    });
    
    await consent.save();
    logger.info('Consent recorded', { userId: data.userId, type: data.consentType });
    return consent;
  }

  // GDPR: Export user data
  static async exportUserData(userId: string, institutionId: string) {
    const user = await User.findById(userId);
    const student = await Student.findOne({ userId });
    
    const exportData = {
      personal: user?.toObject(),
      educational: student?.toObject(),
      consents: await Consent.find({ userId }),
      timestamp: new Date().toISOString()
    };

    await DataRequest.create({
      userId,
      institutionId,
      requestType: 'export',
      status: 'completed',
      data: exportData,
      completedAt: new Date()
    });

    return exportData;
  }

  // GDPR: Delete user data
  static async deleteUserData(userId: string, institutionId: string) {
    await User.findByIdAndUpdate(userId, { 
      status: 'deleted',
      email: `deleted_${userId}@deleted.com`,
      firstName: 'Deleted',
      lastName: 'User'
    });

    await DataRequest.create({
      userId,
      institutionId,
      requestType: 'delete',
      status: 'completed',
      completedAt: new Date()
    });

    logger.info('User data deleted', { userId });
  }

  // FERPA: Check access permission
  static async checkEducationalRecordAccess(
    recordId: string, 
    userId: string, 
    purpose: string
  ): Promise<boolean> {
    const record = await EducationalRecord.findById(recordId);
    if (!record) return false;

    // Log access attempt
    record.accessLog.push({
      userId: userId as any,
      accessedAt: new Date(),
      purpose,
      ipAddress: 'system'
    });
    await record.save();

    return record.accessLevel !== 'confidential';
  }

  // COPPA: Verify age compliance
  static async verifyAgeCompliance(userId: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user?.dateOfBirth) return false;

    const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
    return age >= 13;
  }
}