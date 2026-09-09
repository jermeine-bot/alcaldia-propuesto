import { Router } from 'express';
import { culturaController } from '../controllers/culturaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', culturaController.getAll);
router.post('/', authMiddleware, culturaController.create);
router.put('/:id', authMiddleware, culturaController.update);
router.delete('/:id', authMiddleware, culturaController.delete);

export default router;
