import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimiters } from '../middleware/apiSecurity';
import { cacheStrategies } from '../middleware/cache';
import {
  recordConsent,
  exportUserData,
  deleteUserData,
  getStudentPrediction,
  getInstitutionInsights,
  getAttendancePatterns
} from '../controllers/complianceController';

const router = express.Router();

// GDPR Compliance Routes
router.post('/consent', authMiddleware, rateLimiters.api, recordConsent);
router.get('/export-data', authMiddleware, rateLimiters.sensitive, exportUserData);
router.delete('/delete-data', authMiddleware, rateLimiters.sensitive, deleteUserData);

// AI Analytics Routes
router.get('/analytics/student/:studentId', authMiddleware, cacheStrategies.mediumTerm, getStudentPrediction);
router.get('/analytics/institution', authMiddleware, cacheStrategies.analytics, getInstitutionInsights);
router.get('/analytics/attendance-patterns', authMiddleware, cacheStrategies.analytics, getAttendancePatterns);

export default router;