import express from 'express';
import { 
  createGrade, 
  getStudentGrades, 
  publishGrades, 
  calculateStudentGPA,
  bulkCreateGrades,
  getClassGrades
} from '../controllers/gradeController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, authorize(['Teacher', 'Administrator']), createGrade);
router.post('/bulk', protect, authorize(['Teacher', 'Administrator']), bulkCreateGrades);
router.get('/student/:studentId', protect, getStudentGrades);
router.get('/class/:classroomId', protect, authorize(['Teacher', 'Administrator']), getClassGrades);
router.post('/publish', protect, authorize(['Teacher', 'Administrator']), publishGrades);
router.get('/gpa/:studentId', protect, calculateStudentGPA);

export default router;