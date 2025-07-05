import { Router } from 'express';
// 1. Importa a nova função
import { getTop10Ranking, getTop10GroupRanking } from '../controllers/rankingController.js';

const router = Router();

// Rota para ranking individual (existente)
router.get('/geral', getTop10Ranking);

// 2. Adiciona a nova rota para ranking de grupos
router.get('/grupos', getTop10GroupRanking);

export default router;