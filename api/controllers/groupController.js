import prisma from '../database/prisma.js';

export const createGroup = async (req, res) => {
  const { nome } = req.body; // Pega o nome do grupo do corpo da requisição
  const usuarioId = req.user.id; // Pega o ID do usuário logado (do authMiddleware)

  if (!nome) {
    return res.status(400).json({ erro: "O nome do grupo é obrigatório." });
  }

  try {
    // Cria o novo grupo no banco de dados
    // O criador é definido como o 'lider' e também o primeiro dos 'membros'
    const novoGrupo = await prisma.grupo.create({
      data: {
        nome,
        lider: {
          connect: { id: usuarioId }, // Conecta o líder ao usuário atual
        },
        membros: {
          connect: { id: usuarioId }, // Conecta o usuário atual como o primeiro membro
        },
      },
    });

    // Passo Adicional para MongoDB:
    // Também precisamos atualizar o documento do usuário para adicionar o ID do novo grupo
    // à sua lista de grupos.
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        grupos: {
          connect: { id: novoGrupo.id },
        },
      },
    });

    res.status(201).json(novoGrupo);
  } catch (error) {
    if (error.code === 'P2002') { // Erro de campo único (nome do grupo já existe)
      return res.status(409).json({ erro: 'Um grupo com este nome já existe.' });
    }
    console.error("ERRO AO CRIAR GRUPO:", error);
    res.status(500).json({ erro: "Erro ao criar o grupo." });
  }
};

// Função para LISTAR os grupos do usuário logado
export const getMyGroups = async (req, res) => {
  const usuarioId = req.user.id;

  try {
    const grupos = await prisma.grupo.findMany({
      where: {
        membroIds: {
          has: usuarioId, // Filtra os grupos onde o ID do usuário está na lista de membros
        },
      },
    });
    res.status(200).json(grupos);
  } catch (error) {
    console.error("ERRO AO BUSCAR GRUPOS:", error);
    res.status(500).json({ erro: "Erro ao buscar grupos do usuário." });
  }
};

// Função para ver os DETALHES de um grupo específico
export const getGroupDetails = async (req, res) => {
  const { id } = req.params; // Pega o ID do grupo da URL

  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id: id },
      include: {
        // Inclui os dados do líder (apenas o nome)
        lider: {
          select: { nome: true },
        },
        // Inclui os dados dos membros
        membros: {
          select: {
            id: true,
            nome: true,
            pontuacao: true, // Inclui o objeto de pontuação de cada membro
          },
        },
      },
    });

    if (!grupo) {
      return res.status(404).json({ erro: "Grupo não encontrado." });
    }

    // Calcula a pontuação total do grupo somando os pontos de cada membro
    const pontuacaoTotal = grupo.membros.reduce((total, membro) => {
      // Se o membro tiver pontuação, soma os pontos. Se não, soma 0.
      return total + (membro.pontuacao ? membro.pontuacao.pontos : 0);
    }, 0);

    // Formata a resposta para ser mais amigável
    const respostaFormatada = {
      id: grupo.id,
      nome: grupo.nome,
      lider: grupo.lider.nome,
      pontuacaoTotal: pontuacaoTotal,
      membros: grupo.membros.map(m => ({
        id: m.id,
        nome: m.nome,
        pontos: m.pontuacao ? m.pontuacao.pontos : 0,
      })),
    };

    res.status(200).json(respostaFormatada);
  } catch (error) {
    console.error("ERRO AO BUSCAR DETALHES DO GRUPO:", error);
    res.status(500).json({ erro: "Erro ao buscar detalhes do grupo." });
  }
};

// Adicione esta função ao arquivo groupController.js

export const inviteToGroup = async (req, res) => {
  const { id: grupoId } = req.params; // ID do grupo, pego da URL
  const { email: emailConvidado } = req.body; // Email do usuário a ser convidado
  const usuarioLiderId = req.user.id; // ID do usuário que está fazendo a requisição

  if (!emailConvidado) {
    return res.status(400).json({ erro: "O e-mail do usuário a ser convidado é obrigatório." });
  }

  try {
    // 1. Busca o grupo e verifica se o requisitante é o líder
    const grupo = await prisma.grupo.findUnique({
      where: { id: grupoId },
    });

    if (!grupo) {
      return res.status(404).json({ erro: "Grupo não encontrado." });
    }

    if (grupo.liderId !== usuarioLiderId) {
      return res.status(403).json({ erro: "Apenas o líder do grupo pode convidar novos membros." }); // 403: Forbidden
    }

    // 2. Busca o usuário a ser convidado pelo e-mail
    const usuarioConvidado = await prisma.usuario.findUnique({
      where: { email: emailConvidado },
    });

    if (!usuarioConvidado) {
      return res.status(404).json({ erro: "Usuário a ser convidado não encontrado." });
    }

    // 3. Verifica se o usuário já é membro do grupo
    if (grupo.membroIds.includes(usuarioConvidado.id)) {
      return res.status(409).json({ erro: "Este usuário já é membro do grupo." }); // 409: Conflict
    }

    // 4. Adiciona o novo membro ao grupo e o grupo ao usuário (transação)
    // Usamos uma transação para garantir que ambas as atualizações aconteçam ou nenhuma delas.
    const [, grupoAtualizado] = await prisma.$transaction([
      // Atualiza o usuário convidado, adicionando o ID do grupo à sua lista
      prisma.usuario.update({
        where: { id: usuarioConvidado.id },
        data: {
          grupos: {
            connect: { id: grupoId },
          },
        },
      }),
      // Atualiza o grupo, adicionando o ID do usuário convidado à sua lista de membros
      prisma.grupo.update({
        where: { id: grupoId },
        data: {
          membros: {
            connect: { id: usuarioConvidado.id },
          },
        },
      }),
    ]);

    res.status(200).json({ mensagem: "Usuário convidado com sucesso!", grupo: grupoAtualizado });
  } catch (error) {
    console.error("ERRO AO CONVIDAR PARA GRUPO:", error);
    res.status(500).json({ erro: "Erro ao processar o convite." });
  }
};