import express from 'express';
import { 
  getDashboardAnalytics,
  generateAnalyticsReport,
  getPerformanceTrends,
  getAlerts,
  resolveAlert
} from '../controllers/analyticsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/dashboard', protect, authorize(['Administrator', 'Teacher']), getDashboardAnalytics);
router.post('/reports', protect, authorize(['Administrator']), generateAnalyticsReport);
router.get('/trends', protect, authorize(['Administrator', 'Teacher']), getPerformanceTrends);
router.get('/alerts', protect, getAlerts);
router.put('/alerts/:alertId/resolve', protect, authorize(['Administrator']), resolveAlert);

export default router;