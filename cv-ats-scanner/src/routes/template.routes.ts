import { Router } from 'express';
import { listTemplates, createTemplate, editTemplate, deleteTemplate } from '../controllers/template.controller';

const router = Router();

router.get('/', listTemplates);
router.post('/', createTemplate);
router.put('/:id', editTemplate);
router.delete('/:id', deleteTemplate);

export default router;