import jwt from 'jsonwebtoken';
import prisma from '../database/prisma.js';

const adminMiddleware = async (req, res, next) => {
  // Pega o token do header da mesma forma que o authMiddleware
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: "Acesso negado. Token não fornecido." });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuarioId = decoded.id;

    // --- PASSO EXTRA E CRUCIAL ---
    // Busca o utilizador no banco de dados para verificar o seu cargo
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    // Se o utilizador não for encontrado ou não for um ADMIN, nega o acesso
    if (!usuario || usuario.cargo !== 'ADMIN') {
      // 403 Forbidden significa: "Eu sei quem você é, mas você não tem permissão para estar aqui."
      return res.status(403).json({ erro: "Acesso negado. Apenas administradores." });
    }
    
    // Se for um admin, anexa os dados do utilizador à requisição e prossegue
    req.user = usuario;
    next();

  } catch (error) {
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
};

export default adminMiddleware;