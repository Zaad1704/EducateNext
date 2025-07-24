import express from 'express';
import { generateQR, validateQR } from '../controllers/qrController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate/:userId', protect, generateQR);
router.get('/validate/:qrData', protect, validateQR);

export default router;