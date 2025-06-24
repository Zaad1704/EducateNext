import { Router } from 'express';
import { enrollStudent, listEnrollments } from '../controllers/enrollmentController';

const router = Router();

router.post('/', enrollStudent);
router.get('/', listEnrollments);

export default router;