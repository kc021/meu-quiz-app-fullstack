import prisma from '../database/prisma.js';

// --- GESTÃO DE CATEGORIAS ---

export const createCategory = async (req, res) => {
  const { nome } = req.body;
  if (!nome) {
    return res.status(400).json({ erro: "O nome da categoria é obrigatório." });
  }
  try {
    const novaCategoria = await prisma.categoria.create({ data: { nome } });
    res.status(201).json(novaCategoria);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ erro: 'Uma categoria com este nome já existe.' });
    }
    res.status(500).json({ erro: "Erro ao criar categoria." });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  if (!nome) {
    return res.status(400).json({ erro: "O novo nome da categoria é obrigatório." });
  }
  try {
    const categoriaAtualizada = await prisma.categoria.update({
      where: { id: id },
      data: { nome: nome },
    });
    res.status(200).json(categoriaAtualizada);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar categoria." });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.categoria.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    console.error("ERRO AO APAGAR CATEGORIA:", error);
    res.status(500).json({ erro: "Erro ao apagar categoria. Verifique se existem questões ou salas de jogo associadas a ela." });
  }
};

// --- GESTÃO DE QUESTÕES ---

export const getAllQuestions = async (req, res) => {
  try {
    const questoes = await prisma.questao.findMany({
      include: {
        categoria: { select: { nome: true } },
      },
    });
    res.status(200).json(questoes);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar questões." });
  }
};

// POST /api/admin/questoes (LÓGICA ATUALIZADA)
export const createQuestion = async (req, res) => {
  // Agora recebemos o 'tipo' do frontend
  const { enunciado, opcoes, respostaCorreta, categoriaId, tipo } = req.body;
  
  if (!enunciado || !tipo || !categoriaId || respostaCorreta === undefined) {
    return res.status(400).json({ erro: "Campos essenciais em falta." });
  }

  // Objeto de dados que será enviado para o Prisma
  const dataToCreate = {
    enunciado,
    tipo,
    categoria: { connect: { id: categoriaId } },
  };

  // Lógica condicional baseada no tipo de questão
  if (tipo === 'VERDADEIRO_FALSO') {
    const respostaNum = parseInt(respostaCorreta, 10);
    if (respostaNum !== 0 && respostaNum !== 1) {
      return res.status(400).json({ erro: "Para Verdadeiro/Falso, a resposta correta deve ser 0 (Verdadeiro) ou 1 (Falso)." });
    }
    dataToCreate.opcoes = ["Verdadeiro", "Falso"]; // Opções são fixas
    dataToCreate.respostaCorreta = respostaNum;
  } else { // Assume MULTIPLA_ESCOLHA como padrão
    if (!opcoes || !Array.isArray(opcoes) || opcoes.length < 2) {
        return res.status(400).json({ erro: "Para Múltipla Escolha, são necessárias pelo menos 2 opções." });
    }
    const respostaNum = parseInt(respostaCorreta, 10);
     if (isNaN(respostaNum) || respostaNum >= opcoes.length || respostaNum < 0) {
      return res.status(400).json({ erro: "O índice da resposta correta é inválido para as opções fornecidas." });
    }
    dataToCreate.opcoes = opcoes;
    dataToCreate.respostaCorreta = respostaNum;
  }

  try {
    const novaQuestao = await prisma.questao.create({ data: dataToCreate });
    res.status(201).json(novaQuestao);
  } catch (error) {
    console.error("ERRO AO CRIAR QUESTÃO:", error);
    res.status(500).json({ erro: "Erro ao criar a questão. Verifique se o categoriaId é válido." });
  }
};

// PUT /api/admin/questoes/:id (LÓGICA ATUALIZADA)
export const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { enunciado, opcoes, respostaCorreta, categoriaId, tipo } = req.body;

  // Objeto de dados que será enviado para o Prisma
  const dataToUpdate = {
    enunciado,
    categoriaId,
    tipo,
  };

  if (tipo === 'VERDADEIRO_FALSO') {
    dataToUpdate.opcoes = ["Verdadeiro", "Falso"];
    dataToUpdate.respostaCorreta = parseInt(respostaCorreta, 10);
  } else {
    dataToUpdate.opcoes = opcoes;
    dataToUpdate.respostaCorreta = parseInt(respostaCorreta, 10);
  }

  try {
    const questaoAtualizada = await prisma.questao.update({
      where: { id: id },
      data: dataToUpdate,
    });
    res.status(200).json(questaoAtualizada);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar a questão." });
  }
};

// DELETE /api/admin/questoes/:id
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.questao.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: "Erro ao apagar a questão." });
  }
};