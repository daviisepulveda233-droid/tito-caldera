import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PedidoModel } from '../models/pedidoModel';

export const PedidoController = {
  async crear(req: AuthRequest, res: Response) {
    try {
      const { items } = req.body;
      const usuario = req.user;

      if (!usuario) {
        return res.status(401).json({ error: 'Debe iniciar sesión para realizar una compra' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: '400 Bad Request: El carrito está vacío. Agregue productos antes de comprar.',
        });
      }

      // El total lo calcula el backend con los precios de la base
      const nuevoPedido = await PedidoModel.crearPedido(
        usuario.id,
        items,
        {
          nombre: usuario.nombre,
          email: usuario.email,
        }
      );

      return res.status(201).json({
        mensaje: '¡Pedido registrado con éxito!',
        pedido: nuevoPedido,
      });
    } catch (error: any) {
      console.error('Error al procesar compra:', error.message);
      const statusCode = error.status || 400;
      return res.status(statusCode).json({
        error: error.message || 'Error al procesar el pedido',
      });
    }
  },

  async misPedidos(req: AuthRequest, res: Response) {
    try {
      const usuario = req.user;
      if (!usuario) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const pedidos = await PedidoModel.getByUsuarioId(usuario.id);
      return res.json(pedidos);
    } catch (error: any) {
      return res.status(500).json({ error: 'Error al consultar historial de pedidos' });
    }
  },

  async obtenerTodos(req: AuthRequest, res: Response) {
    try {
      const pedidos = await PedidoModel.getAll();
      return res.json(pedidos);
    } catch (error: any) {
      return res.status(500).json({ error: 'Error al consultar pedidos' });
    }
  },
};
