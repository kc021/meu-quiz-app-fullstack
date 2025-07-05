import { Router } from 'express';
// Importamos a nova função 'login' do controller
import { registrar, login } from '../controllers/authController.js';

const router = Router();

// Rota de registro (existente)
router.post('/registrar', registrar);

// Nova rota de login
router.post('/login', login);

export default router;