import { Request, Response } from 'express';
import { ComplianceService } from '../services/complianceService';
import { AIAnalyticsService } from '../services/aiAnalyticsService';
import { asyncHandler } from '../middleware/errorHandler';
import { cacheStrategies } from '../middleware/cache';

// GDPR Consent Management
export const recordConsent = asyncHandler(async (req: Request, res: Response) => {
  const { consentType, granted } = req.body;
  const userId = req.user?.id;
  const institutionId = req.user?.institutionId;

  const consent = await ComplianceService.recordConsent({
    userId,
    institutionId,
    consentType,
    granted,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || ''
  });

  res.json({ success: true, consent });
});

// GDPR Data Export
export const exportUserData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const institutionId = req.user?.institutionId;

  const data = await ComplianceService.exportUserData(userId, institutionId);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.json"`);
  res.json(data);
});

// GDPR Data Deletion
export const deleteUserData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const institutionId = req.user?.institutionId;

  await ComplianceService.deleteUserData(userId, institutionId);
  res.json({ success: true, message: 'Data deletion request processed' });
});

// AI Analytics - Student Performance
export const getStudentPrediction = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const prediction = await AIAnalyticsService.predictPerformance(studentId);
  res.json(prediction);
});

// AI Analytics - Institution Insights
export const getInstitutionInsights = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;
  const insights = await AIAnalyticsService.generateInstitutionInsights(institutionId);
  res.json(insights);
});

// AI Analytics - Attendance Patterns
export const getAttendancePatterns = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.user?.institutionId;
  const patterns = await AIAnalyticsService.analyzeAttendancePatterns(institutionId);
  res.json(patterns);
});