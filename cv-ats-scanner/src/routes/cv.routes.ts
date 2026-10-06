import { Router } from 'express';
import { upload } from '../utils/multerConfig';
import { uploadCV } from '../controllers/cv.controller';
import { bulkUploadCV } from '../controllers/bulkCv.controller';

const router = Router();

router.post('/upload', upload.single('cv'), uploadCV);
router.post('/bulk-upload', upload.array('cvs', 10), bulkUploadCV);

export default router;