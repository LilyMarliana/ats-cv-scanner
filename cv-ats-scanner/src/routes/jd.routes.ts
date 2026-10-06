import { Router } from 'express';
import { analyzeJD } from '../controllers/jd.controller';

const router = Router();

router.post('/analyze', analyzeJD);

export default router;