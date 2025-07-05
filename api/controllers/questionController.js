import prisma from '../database/prisma.js';

export const createQuestion = async (req, res) => {
  // O corpo da requisição terá os dados da questão e o ID da categoria
  const { enunciado, opcoes, respostaCorreta, categoriaId } = req.body;

  // Validação dos dados de entrada
  if (!enunciado || !opcoes || respostaCorreta === undefined || !categoriaId) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios: enunciado, opcoes, respostaCorreta, categoriaId." });
  }

  if (!Array.isArray(opcoes) || opcoes.length < 2) {
    return res.status(400).json({ erro: "O campo 'opcoes' deve ser uma lista com pelo menos 2 opções." });
  }

  if (respostaCorreta < 0 || respostaCorreta >= opcoes.length) {
    return res.status(400).json({ erro: "O campo 'respostaCorreta' deve ser um índice válido do array de opções." });
  }

  try {
    // Verifica se a categoria informada realmente existe
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoriaExistente) {
      return res.status(404).json({ erro: "A categoria especificada não foi encontrada." });
    }

    // Cria a nova questão no banco de dados, associando-a à categoria
    const novaQuestao = await prisma.questao.create({
      data: {
        enunciado,
        opcoes,
        respostaCorreta,
        categoriaId, // Estabelece a relação
      },
    });

    res.status(201).json(novaQuestao);
  } catch (error) {
    console.error("ERRO DETALHADO AO CRIAR QUESTÃO:", error);
    res.status(500).json({ erro: "Erro ao criar questão." });
  }
};

// Adicione esta função ao arquivo questionController.js

export const getQuestionsByCategory = async (req, res) => {
  try {
    // Pega o ID da categoria dos parâmetros da URL
    const { categoriaId } = req.params;

    const questions = await prisma.questao.findMany({
      where: {
        categoriaId: categoriaId,
      },
      // Seleciona apenas os campos que queremos enviar para o jogador
      // OMITINDO a resposta correta por segurança!
      select: {
        id: true,
        enunciado: true,
        opcoes: true,
        categoriaId: true
      }
    });

    // Se não houver questões para aquela categoria
    if (questions.length === 0) {
      return res.status(404).json({ erro: "Nenhuma questão encontrada para esta categoria." });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error("ERRO AO BUSCAR QUESTÕES POR CATEGORIA:", error);
    res.status(500).json({ erro: "Erro ao buscar questões." });
  }
};

// Adicione esta função ao arquivo questionController.js

export const submitAnswer = async (req, res) => {
  const { questaoId } = req.params; // Pega o ID da questão da URL
  const { respostaDoUsuario } = req.body; // Pega a resposta enviada pelo jogador
  const usuarioId = req.user.id; // Pega o ID do usuário logado (do nosso authMiddleware)

  // Validação
  if (respostaDoUsuario === undefined) {
    return res.status(400).json({ erro: "A 'respostaDoUsuario' é obrigatória." });
  }

  try {
    const questao = await prisma.questao.findUnique({
      where: { id: questaoId },
    });

    if (!questao) {
      return res.status(404).json({ erro: "Questão não encontrada." });
    }

    const acertou = questao.respostaCorreta === respostaDoUsuario;

    // --- NOVA LÓGICA DE PONTUAÇÃO ---
    if (acertou) {
      // Se acertou, vamos atualizar a pontuação do usuário.
      // Usamos 'upsert' para criar o placar se ele não existir, ou atualizá-lo se já existir.
      await prisma.pontuacao.upsert({
        where: {
          usuarioId: usuarioId, // Encontra o placar pelo ID do usuário
        },
        update: {
          pontos: {
            increment: 10, // Se já existe, incrementa 10 pontos
          },
        },
        create: {
          usuarioId: usuarioId,
          pontos: 10, // Se não existe, cria com 10 pontos
        },
      });
    }

    // Retorna o resultado da jogada
    res.status(200).json({
      acertou: acertou,
      respostaCorreta: questao.respostaCorreta,
    });

  } catch (error) {
    console.error("ERRO AO SUBMETER RESPOSTA:", error);
    res.status(500).json({ erro: "Erro ao processar resposta." });
  }
};

