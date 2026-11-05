import { Router } from 'express';
import { PedidoController } from '../controllers/pedidoController';
import { verificarUsuario, requerirAdmin } from '../middleware/auth';

const router = Router();

// Crear pedido: requiere estar logueado (el total lo calcula el backend con los precios de la BD)
router.post('/', verificarUsuario, PedidoController.crear);

// Mis pedidos (Requisito extra)
router.get('/mis-pedidos', verificarUsuario, PedidoController.misPedidos);

// Todos los pedidos para el panel admin
router.get('/todos', verificarUsuario, requerirAdmin, PedidoController.obtenerTodos);

export default router;
