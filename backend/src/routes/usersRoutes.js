import { Router } from 'express';
import { usersController } from '../controllers/usersController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware(['superadmin', 'editor']), usersController.getAll);
router.post('/', authMiddleware, roleMiddleware(['superadmin']), usersController.create);
router.put('/:id', authMiddleware, roleMiddleware(['superadmin']), usersController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['superadmin']), usersController.delete);

export default router;
