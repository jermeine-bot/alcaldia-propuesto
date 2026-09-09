import { Router } from 'express';
import { contactoController } from '../controllers/contactoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', contactoController.getContacto);
router.put('/', authMiddleware, contactoController.updateContacto);

export default router;
