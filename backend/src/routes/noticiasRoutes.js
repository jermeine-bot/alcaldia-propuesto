import { Router } from 'express';
import { noticiasController } from '../controllers/noticiasController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Rutas Públicas (Landing y lectura en CMS)
router.get('/', noticiasController.getAll);
router.get('/:id', noticiasController.getById);

// Rutas Protegidas (CMS Admin con Token JWT)
router.post('/', authMiddleware, noticiasController.create);
router.put('/:id', authMiddleware, noticiasController.update);
router.delete('/:id', authMiddleware, noticiasController.delete);
router.post('/upload-image', authMiddleware, upload.single('image'), noticiasController.uploadImage);

export default router;
