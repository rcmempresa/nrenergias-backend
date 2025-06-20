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

const getShippingAddressByOrderId = async (orderId) => {
  try {
    const result = await pool.query('SELECT address FROM shipping_details WHERE order_id = $1', [orderId]);
    return result.rows[0]; 
  } catch (error) {
    console.error('Erro ao buscar endereço de envio por ID da encomenda:', error);
    throw error;
  }
};

module.exports = { 
  getAllEncomendas, 
  getShippingAddressByOrderId};
