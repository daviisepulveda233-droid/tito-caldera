import { Request, Response } from 'express';
import { CategoriaModel } from '../models/categoriaModel';

export const CategoriaController = {
  async obtenerTodas(req: Request, res: Response) {
    try {
      const categorias = await CategoriaModel.getAll();
      return res.json(categorias);
    } catch (error: any) {
      console.error('Error en CategoriaController.obtenerTodas:', error);
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }
  },

  async obtenerPorId(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de categoría inválido' });
      }

      const categoria = await CategoriaModel.getById(id);
      if (!categoria) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      return res.json(categoria);
    } catch (error: any) {
      return res.status(500).json({ error: 'Error al consultar la categoría' });
    }
  },
};
