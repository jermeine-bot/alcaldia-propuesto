import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.put('/change-password', authMiddleware, authController.changePassword);

export default router;
