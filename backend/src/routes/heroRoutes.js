import { Router } from 'express';
import { heroController } from '../controllers/heroController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', heroController.getHero);
router.put('/', authMiddleware, heroController.updateHero);

export default router;
