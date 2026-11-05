import { Router } from 'express';
import { ProductoController } from '../controllers/productoController';
import { verificarUsuario, requerirAdmin } from '../middleware/auth';

const router = Router();

// Públicos
router.get('/', ProductoController.obtenerTodos);
router.get('/:id', ProductoController.obtenerPorId);

// Protegidos con rol Admin (Devuelve 403 si un cliente lo intenta)
router.post('/', verificarUsuario, requerirAdmin, ProductoController.crear);
router.put('/:id', verificarUsuario, requerirAdmin, ProductoController.actualizar);
router.delete('/:id', verificarUsuario, requerirAdmin, ProductoController.eliminar);

export default router;
