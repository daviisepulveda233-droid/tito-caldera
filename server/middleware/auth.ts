import { Request, Response, NextFunction } from 'express';
import { UsuarioModel } from '../models/usuarioModel';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    nombre: string;
    rol: 'cliente' | 'admin';
  };
}

export async function verificarUsuario(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-user-id']) {
      token = String(req.headers['x-user-id']);
    }

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado. Debe iniciar sesión para realizar esta acción.',
      });
    }

    // El token puede ser el ID directo del usuario o un token codificado
    const userId = token.startsWith('token-') ? token.replace('token-', '') : token;
    const user = await UsuarioModel.getById(userId);

    if (!user) {
      return res.status(401).json({
        error: 'Sesión inválida o expirada. Por favor inicie sesión nuevamente.',
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    return res.status(401).json({ error: error.message || 'Error de autenticación' });
  }
}

export function requerirAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Debe iniciar sesión primero' });
  }

  // REQUISITO ESTRICTO DE LA CÁTEDRA:
  // "ABM de productos con rol admin; un cliente recibe 403"
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      error: '403 Forbidden: Acción reservada únicamente para administradores de la panadería.',
      rolActual: req.user.rol,
    });
  }

  next();
}
