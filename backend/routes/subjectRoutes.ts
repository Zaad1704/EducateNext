import { Router } from 'express';
import { createSubject, listSubjects } from '../controllers/subjectController';

const router = Router();

router.post('/', createSubject);
router.get('/', listSubjects);

export default router;