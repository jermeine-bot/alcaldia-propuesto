import { Router } from 'express';
import { serviciosController } from '../controllers/serviciosController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();
const canManageServices = [authMiddleware, roleMiddleware(['superadmin', 'editor'])];

router.get('/', serviciosController.getAll);
router.get('/settings', serviciosController.getSettings);
router.put('/settings', ...canManageServices, serviciosController.updateSettings);
router.post('/', ...canManageServices, serviciosController.create);
router.put('/:id', ...canManageServices, serviciosController.update);
router.delete('/:id', ...canManageServices, serviciosController.delete);
router.post('/:id/subservicios', ...canManageServices, serviciosController.saveSubservicio);
router.put('/:id/subservicios/:subservicioId', ...canManageServices, serviciosController.saveSubservicio);
router.delete('/:id/subservicios/:subservicioId', ...canManageServices, serviciosController.deleteSubservicio);

export default router;