import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // 1. Pega o token do header da requisição
  const authHeader = req.headers.authorization;

  // 2. Verifica se o header existe e se tem o formato "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: "Acesso negado. Nenhum token fornecido." });
  }

  // 3. Extrai o token do header (removendo a parte "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 4. Verifica se o token é válido usando nosso segredo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Se for válido, adiciona os dados do usuário (payload) na requisição
    // para que as próximas funções (controllers) possam usá-los
    req.user = decoded;

    // 6. Chama a próxima função no fluxo da requisição
    next();
  } catch (error) {
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
};

export default authMiddleware;