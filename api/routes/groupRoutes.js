import { Router } from 'express';
// 1. Importa a nova função
import { createGroup, getMyGroups, getGroupDetails, inviteToGroup } from '../controllers/groupController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Rotas existentes
router.post('/', authMiddleware, createGroup);
router.get('/meus', authMiddleware, getMyGroups);
router.get('/:id', authMiddleware, getGroupDetails);

// 2. Adiciona a nova rota para convidar
router.post('/:id/convidar', authMiddleware, inviteToGroup);

export default router;