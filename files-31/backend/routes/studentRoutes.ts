import { Router } from 'express';
import { addStudent, listStudents } from '../controllers/studentController';

const router = Router();

router.post('/', addStudent);
router.get('/', listStudents);

export default router;