import { Router } from 'express';
import { createGameRoom } from '../controllers/gameController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Rota protegida para criar uma nova sala de jogo
router.post('/criar', authMiddleware, createGameRoom);

export default router;