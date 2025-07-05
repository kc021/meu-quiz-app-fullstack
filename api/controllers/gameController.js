import prisma from '../database/prisma.js';

// Função auxiliar para gerar um código de sala aleatório de 4 letras
const generateRoomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const createGameRoom = async (req, res) => {
  const hostId = req.user.id;
  const { categoriaId } = req.body;

  if (!categoriaId) {
    return res.status(400).json({ erro: "É necessário escolher uma categoria para criar a sala." });
  }

  try {
    const codigoDaSala = generateRoomCode();

    const novaSala = await prisma.salaDeJogo.create({
      data: {
        codigo: codigoDaSala,
        hostId: hostId,
        // --- CORREÇÃO APLICADA AQUI ---
        categoria: {
          connect: { id: categoriaId },
        },
        jogadores: {
          connect: { id: hostId },
        },
      },
    });

    await prisma.usuario.update({
      where: { id: hostId },
      data: {
        salaDeJogoId: novaSala.id,
      },
    });

    res.status(201).json(novaSala);
  } catch (error) {
    console.error("ERRO AO CRIAR SALA DE JOGO:", error);
    res.status(500).json({ erro: "Erro ao criar a sala de jogo." });
  }
};