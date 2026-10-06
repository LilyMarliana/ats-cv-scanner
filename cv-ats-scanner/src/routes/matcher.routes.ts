import { Router } from 'express';
import { matchCVAndJD, rankCVAgainstAllTemplates } from '../controllers/matcher.controller';

const router = Router();

router.post('/compare', matchCVAndJD);
router.post('/rank-all', rankCVAgainstAllTemplates);

export default router;