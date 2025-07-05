import prisma from '../database/prisma.js';

export const getTop10Ranking = async (req, res) => {
  try {
    // Busca as 10 maiores pontuações
    const ranking = await prisma.pontuacao.findMany({
      // Ordena os resultados pelos pontos em ordem decrescente
      orderBy: {
        pontos: 'desc',
      },
      // Pega apenas os 10 primeiros resultados
      take: 10,
      // Inclui os dados do usuário relacionado para podermos mostrar o nome
      include: {
        usuario: {
          select: {
            nome: true, // Seleciona apenas o nome do usuário
          },
        },
      },
    });

    // Formata a resposta para ser mais limpa e fácil de usar no frontend
    const rankingFormatado = ranking.map((item, index) => ({
      posicao: index + 1,
      nome: item.usuario.nome,
      pontos: item.pontos,
    }));

    res.status(200).json(rankingFormatado);
  } catch (error) {
    console.error("ERRO AO BUSCAR RANKING:", error);
    res.status(500).json({ erro: "Erro ao buscar o ranking." });
  }
};
// Adicione esta função ao arquivo rankingController.js

export const getTop10GroupRanking = async (req, res) => {
  try {
    // 1. Busca todos os grupos e inclui os dados dos membros e suas pontuações
    const todosOsGrupos = await prisma.grupo.findMany({
      include: {
        membros: {
          include: {
            pontuacao: true, // Inclui o objeto de pontuação de cada membro
          },
        },
      },
    });

    // 2. Calcula a pontuação total para cada grupo
    const gruposComPontuacao = todosOsGrupos.map(grupo => {
      const pontuacaoTotal = grupo.membros.reduce((total, membro) => {
        // Soma os pontos do membro atual ao total (se o membro tiver pontuação)
        return total + (membro.pontuacao ? membro.pontuacao.pontos : 0);
      }, 0);

      return {
        id: grupo.id,
        nome: grupo.nome,
        pontuacaoTotal: pontuacaoTotal,
      };
    });

    // 3. Ordena os grupos pela pontuação total em ordem decrescente
    const ranking = gruposComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);

    // 4. Pega apenas os 10 primeiros
    const top10 = ranking.slice(0, 10);

    // 5. Formata a resposta final com a posição
    const rankingFormatado = top10.map((item, index) => ({
      posicao: index + 1,
      nome: item.nome,
      pontuacaoTotal: item.pontuacaoTotal,
    }));

    res.status(200).json(rankingFormatado);
  } catch (error) {
    console.error("ERRO AO BUSCAR RANKING DE GRUPOS:", error);
    res.status(500).json({ erro: "Erro ao buscar o ranking de grupos." });
  }
};