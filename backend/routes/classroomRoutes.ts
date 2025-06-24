import { Router } from 'express';
import { createClassroom, listClassrooms } from '../controllers/classroomController';

const router = Router();

router.post('/', createClassroom);
router.get('/', listClassrooms);

export default router;