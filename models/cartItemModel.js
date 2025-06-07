const pool = require('../config/db');

// Função para encontrar um item no carrinho
const getItemInCartByProduct = async (cartId, productId) => {
  try {
    const query = 'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 LIMIT 1';
    const result = await pool.query(query, [cartId, productId]);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar item no carrinho:', error);
    throw error;
  }
};

// Função para adicionar um item ao carrinho
const addItemToCartProduct = async (cartId, productId, quantidade, precoUnitario, precoTotal) => {
  try {
    const query = `
      INSERT INTO cart_items (cart_id, product_id, quantidade, preco_unitario, preco_total)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const result = await pool.query(query, [cartId, productId, quantidade, precoUnitario, precoTotal]);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao adicionar item ao carrinho:', error);
    throw error;
  }
};

// Função para encontrar um item no carrinho pelo service_id
const getItemInCartByService = async (cartId, serviceId) => {
  try {
    const query = 'SELECT * FROM cart_items WHERE cart_id = $1 AND service_id = $2 LIMIT 1';
    const result = await pool.query(query, [cartId, serviceId]);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar item no carrinho (serviço):', error);
    throw error;
  }
};

// Função para adicionar um item ao carrinho com service_id
const addItemToCartService = async (cartId, serviceId, quantidade, precoUnitario, precoTotal) => {
  try {
    const query = `
      INSERT INTO cart_items (cart_id, service_id, quantidade, preco_unitario, preco_total)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const result = await pool.query(query, [cartId, serviceId, quantidade, precoUnitario, precoTotal]);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao adicionar item ao carrinho (serviço):', error);
    throw error;
  }
};


// Função para atualizar a quantidade e o preço total de um item no carrinho
const updateItemInCart = async (itemId, newQuantity, newTotalPrice) => {
  try {
    const query = `
      UPDATE cart_items
      SET quantidade = $1, preco_total = $2
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [newQuantity, newTotalPrice, itemId]);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao atualizar item no carrinho:', error);
    throw error;
  }
};

module.exports = {
  getItemInCartByProduct,
  addItemToCartProduct,
  getItemInCartByService,
  addItemToCartService,
  updateItemInCart,
};
