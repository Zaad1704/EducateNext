import express from 'express';
import { 
  createSite, 
  getSite, 
  updateSite, 
  publishSite, 
  syncStaffData,
  getPublicSite 
} from '../controllers/cmsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes (require authentication)
router.post('/sites', protect, authorize(['Administrator']), createSite);
router.get('/sites', protect, getSite);
router.put('/sites', protect, authorize(['Administrator', 'Website Manager']), updateSite);
router.post('/sites/publish', protect, authorize(['Administrator']), publishSite);
router.post('/sites/sync-staff', protect, authorize(['Administrator', 'Website Manager']), syncStaffData);

// Public routes (no authentication required)
router.get('/public/:domain', getPublicSite);

export default router;