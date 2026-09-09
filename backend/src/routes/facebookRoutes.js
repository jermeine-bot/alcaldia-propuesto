import { Router } from 'express';
import { facebookController } from '../controllers/facebookController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/status', facebookController.getStatus);
router.post('/sync', authMiddleware, facebookController.syncNow);

export default router;
