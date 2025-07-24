import express from 'express';
import { 
  createReportCard, 
  getReportCards, 
  publishReportCard, 
  bulkGenerateReports 
} from '../controllers/reportCardController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, authorize(['Teacher', 'Administrator']), createReportCard);
router.post('/bulk', protect, authorize(['Administrator']), bulkGenerateReports);
router.get('/', protect, getReportCards);
router.put('/:reportCardId/publish', protect, authorize(['Administrator']), publishReportCard);

export default router;