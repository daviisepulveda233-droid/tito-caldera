import { Router } from 'express';
import { CategoriaController } from '../controllers/categoriaController';

const router = Router();

router.get('/', CategoriaController.obtenerTodas);
router.get('/:id', CategoriaController.obtenerPorId);

export default router;
