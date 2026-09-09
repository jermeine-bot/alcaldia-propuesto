import { Router } from 'express';
import { statsController } from '../controllers/statsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', statsController.getAll);
router.post('/', authMiddleware, statsController.create);
router.put('/:id', authMiddleware, statsController.update);
router.delete('/:id', authMiddleware, statsController.delete);

export default router;
