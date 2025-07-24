import express from 'express';
import { createEvaluation, getEvaluations, finalizeEvaluation } from '../controllers/evaluationController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, authorize(['Administrator', 'Teacher']), createEvaluation);
router.get('/', protect, authorize(['Administrator', 'Teacher']), getEvaluations);
router.put('/:evaluationId/finalize', protect, authorize(['Administrator']), finalizeEvaluation);

export default router;