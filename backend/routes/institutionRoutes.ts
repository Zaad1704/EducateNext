import { Router } from 'express';
import { createInstitution, getInstitutions } from '../controllers/institutionController';

const router = Router();

router.post('/', createInstitution);
router.get('/', getInstitutions);

export default router;