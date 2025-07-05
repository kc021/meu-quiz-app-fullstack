import { Router } from 'express';
import { getMyProfile } from '../controllers/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Rota para buscar o perfil do usuário logado (protegida)
router.get('/me', authMiddleware, getMyProfile);

export default router;