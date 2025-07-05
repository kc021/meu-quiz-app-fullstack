import { Router } from 'express';

// 1. Importa as funções necessárias
import { getAllCategories } from '../controllers/categoryController.js';
import { getQuestionsByCategory } from '../controllers/questionController.js'; // Função que busca as perguntas
import authMiddleware from '../middleware/authMiddleware.js'; // Precisamos do segurança para esta rota

const router = Router();

// Rota pública para listar todas as categorias (continua igual)
router.get('/', getAllCategories);

// --- ROTA RESTAURADA AQUI ---
// Rota para um jogador logado buscar as questões de uma categoria específica para jogar.
// Esta rota é essencial para o modo de jogo solo.
router.get('/:categoriaId/questoes', authMiddleware, getQuestionsByCategory);

export default router;