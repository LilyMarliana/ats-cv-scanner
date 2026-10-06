import { Router } from 'express';
import { listCvHistory, getCvDetail, deleteCv } from '../controllers/history.controller';

const router = Router();

router.get('/', listCvHistory);
router.get('/:id', getCvDetail);
router.delete('/:id', deleteCv);

export default router;