import { Router } from 'express';
import { submitAnswer } from '../controllers/questionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// A única responsabilidade deste ficheiro de rotas agora
// é permitir que um jogador logado submeta uma resposta.
router.post('/:questaoId/responder', authMiddleware, submitAnswer);

export default router;