import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { verificarUsuario } from '../middleware/auth';

const router = Router();

router.post('/registro', AuthController.registro);
router.post('/login', AuthController.login);
router.get('/perfil', verificarUsuario, AuthController.perfil);
router.post('/cambiar-rol-demo', verificarUsuario, AuthController.cambiarRolDemo);

export default router;
