import prisma from '../database/prisma.js'; //

// Função para CRIAR uma nova categoria
export const createCategory = async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: "O nome da categoria é obrigatório." });
    }

    const novaCategoria = await prisma.categoria.create({
      data: {
        nome: nome,
      },
    });

    res.status(201).json(novaCategoria);
  } catch (error) {
    // Adicione esta linha para ver o erro completo no terminal
  console.error("ERRO DETALHADO AO CRIAR CATEGORIA:", error);
    // Trata o erro caso a categoria já exista (por causa do @unique)
    if (error.code === 'P2002') {
      return res.status(409).json({ erro: 'Uma categoria com este nome já existe.' });
    }
    res.status(500).json({ erro: "Erro ao criar categoria." });
  }
};

// Função para LISTAR todas as categorias
export const getAllCategories = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany();
    res.status(200).json(categorias);
  } catch (error) {
    // Adicione esta linha para ver o erro no terminal
    console.error("ERRO DETALHADO AO BUSCAR CATEGORIAS:", error);
    res.status(500).json({ erro: "Erro ao buscar categorias." });
  }
};