// models/User.js
const pool = require('../config/db');

const getAllEncomendas = async () => {
  try {
    const result = await pool.query('SELECT * FROM orders');
    return result.rows;  //Retorna todas as encomendas
  } catch (err) {
    console.error('Erro ao listar todos os usuários:', err);
    throw err;
  }
};


module.exports = { getAllEncomendas };
