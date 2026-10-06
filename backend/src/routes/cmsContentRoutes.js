import { Router } from 'express';
import { cmsContentController } from '../controllers/cmsContentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();
const canManageContent = [authMiddleware, roleMiddleware(['superadmin', 'editor'])];

router.get('/:contentId', cmsContentController.get);
router.put('/:contentId', ...canManageContent, cmsContentController.save);

export default router;
