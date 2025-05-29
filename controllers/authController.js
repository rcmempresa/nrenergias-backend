// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/authConfig');
const User = require('../models/User');


const signup = async (req, res) => {
  const { nome, email, senha, endereco, telefone } = req.body;

  try {
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já registrado' });
    }

    
    const hashedPassword = await bcrypt.hash(senha, 10);

    
    const newUser = await User.createUser(nome, email, hashedPassword, endereco, telefone);
    return res.status(201).json({ message: 'Utilizador criado com sucesso', user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};


const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Utilizador ou password incorretos' });
    }

  
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Utilizadores ou password incorretos' });
    }

    
    const token = jwt.sign({ userId: user.id }, authConfig.secret_key, { expiresIn: authConfig.expires_in });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 3600000,
      domain: 'localhost', 
  });
  
    return res.json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};


const logout = (req, res) => {
  try {
    
    res.clearCookie('token', {
      httpOnly: true, // Garante que o cookie não pode ser acessado via JavaScript
      secure: process.env.NODE_ENV === 'production', // Só permite a remoção do cookie via HTTPS em produção
      sameSite: 'Strict', // Evita o envio do cookie em requisições de outros sites
    });

    return res.json({ message: 'Logout bem-sucedido' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

const getProfile = async (req, res) => {
  try {
    
    const user = await User.getUserById(req.userId); 

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    
    res.json({
      message: 'Você está autenticado!',
      userId: user.id,
      email: user.email,
      nome: user.nome,
      telefone: user.telefone,
    });
  } catch (err) {
    console.error('Erro ao buscar perfil do usuário:', err);
    return res.status(500).json({ message: 'Erro ao buscar perfil do usuário' });
  }
};


module.exports = { signup, login, logout, getProfile};
