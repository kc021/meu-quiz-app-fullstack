import prisma from '../database/prisma.js';

export const getMyProfile = async (req, res) => {
  try {
    const usuarioId = req.user.id; // ID do usuário logado, fornecido pelo authMiddleware

    // Busca o usuário e inclui sua pontuação na mesma consulta
    const perfil = await prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },
      // 'include' é como um JOIN: ele traz os dados relacionados
      include: {
        pontuacao: true, // Inclui o objeto de pontuação relacionado a este usuário
      },
    });

    if (!perfil) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    // Remove a senha do objeto antes de enviar a resposta
    const { senha_hash, ...perfilSeguro } = perfil;

    // Se o usuário ainda não tiver pontuação, o campo 'pontuacao' será nulo.
    // Podemos tratar isso para enviar uma resposta mais amigável.
    const pontuacaoFinal = perfilSeguro.pontuacao ? perfilSeguro.pontuacao.pontos : 0;

    res.status(200).json({
      id: perfilSeguro.id,
      nome: perfilSeguro.nome,
      email: perfilSeguro.email,
      pontos: pontuacaoFinal, // Enviamos um campo 'pontos' de fácil acesso
    });

  } catch (error) {
    console.error("ERRO AO BUSCAR PERFIL:", error);
    res.status(500).json({ erro: "Erro ao buscar perfil do usuário." });
  }
};