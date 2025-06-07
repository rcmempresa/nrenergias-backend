const pool = require('../config/db');

// 🛒 Recupera o carrinho aberto de um usuário
const getOpenCartByUserId = async (userId) => {
  try {
    const query = 'SELECT * FROM carts WHERE user_id = $1 AND status = $2 LIMIT 1';
    const result = await pool.query(query, [userId, 'aberto']);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    throw error;
  }
};

// 🛒 Cria um novo carrinho
const createCart = async (userId) => {
  try {
    const query = 'INSERT INTO carts (user_id, status) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [userId, 'aberto']);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar carrinho:', error);
    throw error;
  }
};

// 🛒 Lista todos os itens (produtos e serviços) do carrinho
const getCartItemsByUserId = async (userId) => {
  try {
    const cartResult = await pool.query(
      `SELECT cart_id 
       FROM carts 
       WHERE user_id = $1 AND status = 'aberto'`, 
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return { error: 'Carrinho não encontrado ou fechado.' };
    }

    const cartId = cartResult.rows[0].cart_id;

    // Produtos
    const produtosResult = await pool.query(
      `SELECT 
         ci.id, 
         ci.product_id, 
         ci.quantidade, 
         ci.preco_unitario, 
         ci.preco_total, 
         p.nome, 
         p.imagem_url
       FROM 
         cart_items ci
       JOIN 
         products p ON ci.product_id = p.id
       WHERE 
         ci.cart_id = $1 AND ci.product_id IS NOT NULL`, 
      [cartId]
    );

    // Serviços
    const servicosResult = await pool.query(
      `SELECT 
         ci.id, 
         ci.service_id, 
         ci.quantidade, 
         ci.preco_unitario, 
         ci.preco_total, 
         s.nome, 
         s.imagem_url
       FROM 
         cart_items ci
       JOIN 
         services s ON ci.service_id = s.id
       WHERE 
         ci.cart_id = $1 AND ci.service_id IS NOT NULL`, 
      [cartId]
    );

    const items = [
      ...produtosResult.rows.map(item => ({ ...item, tipo: 'produto' })),
      ...servicosResult.rows.map(item => ({ ...item, tipo: 'serviço' }))
    ];

    return { cart_id: cartId, items };
  } catch (error) {
    console.error(error);
    return { error: 'Erro ao recuperar os itens do carrinho.' };
  }
};

// 🗑️ Remover item do carrinho (produto ou serviço)
const removeItemFromCart = async (userId, productId = null, serviceId = null) => {
  try {
    const cartResult = await pool.query(
      `SELECT cart_id FROM carts WHERE user_id = $1 AND status = 'aberto'`, 
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return { error: 'Carrinho não encontrado ou fechado.' };
    }

    const cartId = cartResult.rows[0].cart_id;

    let query = `DELETE FROM cart_items WHERE cart_id = $1`;
    const values = [cartId];

    if (productId !== null) {
      query += ` AND product_id = $2`;
      values.push(productId);
    } else if (serviceId !== null) {
      query += ` AND service_id = $2`;
      values.push(serviceId);
    } else {
      return { error: 'Nenhum item especificado para remoção.' };
    }

    const result = await pool.query(query + ` RETURNING *`, values);

    if (result.rows.length === 0) {
      return { error: 'Item não encontrado no carrinho.' };
    }

    return { message: 'Item removido do carrinho.', item: result.rows[0] };
  } catch (error) {
    console.error(error);
    return { error: 'Erro ao remover o item do carrinho.' };
  }
};

module.exports = {
  getOpenCartByUserId,
  createCart,
  getCartItemsByUserId,
  removeItemFromCart
};
