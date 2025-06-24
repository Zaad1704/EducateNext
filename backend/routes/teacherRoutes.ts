import { Router } from 'express';
import { addTeacher, listTeachers } from '../controllers/teacherController';

const router = Router();

router.post('/', addTeacher);
router.get('/', listTeachers);

export default router;