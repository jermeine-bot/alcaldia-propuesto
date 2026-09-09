import { Router } from 'express';
import { proyectosController } from '../controllers/proyectosController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', proyectosController.getAll);
router.post('/', authMiddleware, proyectosController.create);
router.put('/:id', authMiddleware, proyectosController.update);
router.delete('/:id', authMiddleware, proyectosController.delete);

export default router;
