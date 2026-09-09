import { Router } from 'express';
import { auditController } from '../controllers/auditController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();

// Solo usuarios autenticados con rol superadmin o editor pueden ver los logs
router.get('/', authMiddleware, roleMiddleware(['superadmin', 'editor']), auditController.getLogs);

export default router;
