// models/User.js
const pool = require('../config/db');

// Função para criar um novo usuário
const createUser = async (nome, email, senha, endereco, telefone) => {
  try {
    const result = await pool.query(
      'INSERT INTO users (nome, email, senha, endereco, telefone, data_criacao, status) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING *',
      [nome, email, senha, endereco, telefone, 'ativo']
    );
    return result.rows[0];
  } catch (err) {
    console.error('Erro ao criar o usuário:', err);
    throw err;
  }
};

// Função para buscar um usuário pelo e-mail
const getUserByEmail = async (email) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];  // Retorna o primeiro usuário encontrado
  } catch (err) {
    console.error('Erro ao buscar o usuário:', err);
    throw err;
  }
};

// Função para buscar um usuário pelo ID
const getUserById = async (userId) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0];  // Retorna o usuário encontrado
  } catch (err) {
    console.error('Erro ao buscar o usuário pelo ID:', err);
    throw err;
  }
};

const getAllUsers = async () => {
  try {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;  // Retorna todos os usuários encontrados
  } catch (err) {
    console.error('Erro ao listar todos os usuários:', err);
    throw err;
  }
};


module.exports = { createUser, getUserByEmail, getUserById,getAllUsers };
