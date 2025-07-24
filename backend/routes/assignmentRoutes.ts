import express from 'express';
import { createAssignment, getAssignments, submitAssignment } from '../controllers/assignmentController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, authorize(['Teacher', 'Administrator']), createAssignment);
router.get('/', protect, getAssignments);
router.post('/:assignmentId/submit', protect, authorize(['Student']), submitAssignment);

export default router;