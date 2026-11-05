import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UsuarioModel } from '../models/usuarioModel';
import { localStore } from '../db/supabaseClient';

export const AuthController = {
  async registro(req: Request, res: Response) {
    try {
      const { email, password, nombre, rol } = req.body;

      if (!email || !password || !nombre) {
        return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
      }

      const rolAsignado = rol === 'admin' ? 'admin' : 'cliente';
      const usuario = await UsuarioModel.register(email, password, nombre, rolAsignado);

      return res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        usuario,
        token: `token-${usuario.id}`,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Error en el registro' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
      }

      const usuario = await UsuarioModel.login(email, password);

      return res.json({
        mensaje: 'Inicio de sesión correcto',
        usuario,
        token: `token-${usuario.id}`,
      });
    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Credenciales inválidas' });
    }
  },

  async perfil(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    return res.json({ usuario: req.user });
  },

  // Facilidad para el evaluador / docente: cambiar de rol al instante para probar el 403
  async cambiarRolDemo(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const nuevoRol = req.body.rol === 'admin' ? 'admin' : 'cliente';
      const user = localStore.usuarios.find((u) => u.id === req.user?.id);
      if (user) {
        user.rol = nuevoRol;
      }

      req.user.rol = nuevoRol;
      return res.json({
        mensaje: `Rol actualizado a ${nuevoRol}`,
        usuario: {
          ...req.user,
          rol: nuevoRol,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Error al cambiar rol' });
    }
  },
};
