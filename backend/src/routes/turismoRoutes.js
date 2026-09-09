import { Router } from 'express';
import { turismoController } from '../controllers/turismoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', turismoController.getAll);
router.post('/', authMiddleware, turismoController.create);
router.put('/:id', authMiddleware, turismoController.update);
router.delete('/:id', authMiddleware, turismoController.delete);

export default router;
