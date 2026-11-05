import { Request, Response } from 'express';
import { ProductoModel } from '../models/productoModel';

export const ProductoController = {
  async obtenerTodos(req: Request, res: Response) {
    try {
      const { categoria_id, busqueda, todos } = req.query;

      const filtros = {
        categoria_id: categoria_id ? Number(categoria_id) : undefined,
        busqueda: busqueda ? String(busqueda) : undefined,
        soloActivos: todos === 'true' ? false : true,
      };

      const productos = await ProductoModel.getAll(filtros);
      return res.json(productos);
    } catch (error: any) {
      console.error('Error en ProductoController.obtenerTodos:', error);
      return res.status(500).json({ error: 'Error al obtener catálogo de productos' });
    }
  },

  async obtenerPorId(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'El ID del producto debe ser numérico' });
      }

      const producto = await ProductoModel.getById(id);

      // Requisito específico: responder 404 si el producto no existe
      if (!producto) {
        return res.status(404).json({
          error: `404 Not Found: El producto con ID ${id} no existe en la base de datos de la panadería.`,
        });
      }

      return res.json(producto);
    } catch (error: any) {
      return res.status(500).json({ error: 'Error al obtener el detalle del producto' });
    }
  },

  async crear(req: Request, res: Response) {
    try {
      const { nombre, descripcion, precio, stock, imagen_url, categoria_id } = req.body;

      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({ error: 'El nombre del producto es obligatorio' });
      }

      const numPrecio = Number(precio);
      const numStock = Number(stock !== undefined ? stock : 0);
      const numCat = categoria_id ? Number(categoria_id) : 1;

      if (isNaN(numPrecio) || numPrecio < 0) {
        return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a 0 (CHECK precio >= 0)' });
      }

      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({ error: 'El stock debe ser un número entero mayor o igual a 0 (CHECK stock >= 0)' });
      }

      const nuevo = await ProductoModel.create({
        nombre: nombre.trim(),
        descripcion: descripcion || '',
        precio: numPrecio,
        stock: Math.floor(numStock),
        imagen_url:
          imagen_url ||
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
        categoria_id: numCat,
        activo: true,
      });

      return res.status(201).json(nuevo);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Error al crear producto' });
    }
  },

  async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const data = req.body;
      if (data.precio !== undefined) {
        data.precio = Number(data.precio);
        if (isNaN(data.precio) || data.precio < 0) {
          return res.status(400).json({ error: 'El precio no puede ser negativo' });
        }
      }

      if (data.stock !== undefined) {
        data.stock = Number(data.stock);
        if (isNaN(data.stock) || data.stock < 0) {
          return res.status(400).json({ error: 'El stock no puede ser negativo' });
        }
      }

      const actualizado = await ProductoModel.update(id, data);
      if (!actualizado) {
        return res.status(404).json({ error: `Producto con ID ${id} no encontrado` });
      }

      return res.json(actualizado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Error al actualizar el producto' });
    }
  },

  async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      // Soft delete: no borra físicamente para no romper claves foráneas de pedido_items
      const borrado = await ProductoModel.softDelete(id);
      if (!borrado) {
        return res.status(404).json({ error: `Producto con ID ${id} no encontrado` });
      }

      return res.json({ mensaje: `Producto ${id} desactivado correctamente del catálogo` });
    } catch (error: any) {
      return res.status(500).json({ error: 'Error al desactivar el producto' });
    }
  },
};
