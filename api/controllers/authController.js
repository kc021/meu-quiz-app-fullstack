import prisma from '../database/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- FUNÇÃO DE REGISTRO (Sem alterações) ---
export const registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
    }
    if (senha.length < 8) {
      return res.status(400).json({ erro: "A senha deve ter no mínimo 8 caracteres." });
    }

    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ erro: "Este e-mail já está em uso." });
    }

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);

    const novoUsuario = await prisma.usuario.create({
      data: { nome, email, senha_hash }, // O cargo 'USER' é adicionado por padrão pelo schema
    });
    
    const { senha_hash: _, ...usuarioSemSenha } = novoUsuario;

    res.status(201).json({
        mensagem: "Usuário criado com sucesso!",
        usuario: usuarioSemSenha,
    });

  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ erro: "Ocorreu um erro inesperado no servidor." });
  }
};


// --- FUNÇÃO DE LOGIN (Com a alteração) ---
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email },
    });

    if (!usuario) {
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    // --- MUDANÇA APLICADA AQUI ---
    // Agora, o 'cargo' do utilizador é incluído no token.
    const token = jwt.sign(
      { 
        id: usuario.id, 
        nome: usuario.nome, 
        role: usuario.cargo // Adiciona o cargo ao payload do token
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      mensagem: "Login bem-sucedido!",
      token: token
    });

  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ erro: "Ocorreu um erro inesperado no servidor." });
  }
}