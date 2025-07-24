import express from 'express';
import { 
  createIDCard, 
  getIDCard, 
  downloadIDCard, 
  addToWallet, 
  updatePrintStatus,
  bulkGenerateCards 
} from '../controllers/idCardController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, authorize(['Administrator', 'Teacher']), createIDCard);
router.post('/bulk', protect, authorize(['Administrator']), bulkGenerateCards);
router.get('/:userId', protect, getIDCard);
router.get('/:cardId/download', protect, downloadIDCard);
router.post('/:cardId/wallet', protect, addToWallet);
router.put('/:cardId/print-status', protect, authorize(['Administrator']), updatePrintStatus);

export default router;