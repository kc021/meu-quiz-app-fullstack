import { Router } from 'express';
import { 
  createCategory, updateCategory, deleteCategory,
  getAllQuestions, createQuestion, updateQuestion, deleteQuestion
} from '../controllers/adminController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = Router();

// --- Rotas de Gestão de Categorias ---
router.post('/categorias', adminMiddleware, createCategory);
router.put('/categorias/:id', adminMiddleware, updateCategory);
router.delete('/categorias/:id', adminMiddleware, deleteCategory);

// --- Rotas de Gestão de Questões ---
router.get('/questoes', adminMiddleware, getAllQuestions); // Rota nova para listar
router.post('/questoes', adminMiddleware, createQuestion);
router.put('/questoes/:id', adminMiddleware, updateQuestion);
router.delete('/questoes/:id', adminMiddleware, deleteQuestion);

export default router;