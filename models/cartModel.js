const pool = require('../config/db');

// Função para encontrar um carrinho aberto de um usuário
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

// Função para criar um novo carrinho
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

const getCartItemsByUserId = async (userId) => {
  try {
    // 1. Recuperar o carrinho do usuário com status "aberto" (se existir)
    const cartResult = await pool.query(
      `SELECT cart_id 
       FROM carts 
       WHERE user_id = $1 AND status = 'aberto'`, [userId]
    );

    if (cartResult.rows.length === 0) {
      return { error: 'Carrinho não encontrado ou fechado.' };
    }

    const cartId = cartResult.rows[0].cart_id;

    // 2. Recuperar os itens do carrinho
    const result = await pool.query(
        `SELECT 
        ci.id, 
        ci.product_id,
        ci.service_id,
        ci.quantidade, 
        ci.preco_unitario, 
        ci.preco_total, 
        COALESCE(p.nome, s.nome) AS nome,
        COALESCE(p.imagem_url, s.imagem_url, '') AS imagem_url
      FROM 
        cart_items ci
      LEFT JOIN 
        products p ON ci.product_id = p.id
      LEFT JOIN 
        services s ON ci.service_id = s.id
      WHERE 
        ci.cart_id = $1
      `, [cartId]
    );

    if (result.rows.length === 0) {
      return { error: 'Carrinho vazio ou não encontrado.' };
    }

    return { 
      cart_id: cartId,
      items: result.rows 
    };

  } catch (error) {
    console.error(error);
    return { error: 'Erro ao recuperar os itens do carrinho.' };
  }
};

const removeProductFromCart = async (userId, productId) => {
  try {
    // 1. Recuperar o carrinho do usuário com status "aberto"
    const cartResult = await pool.query(
      `SELECT cart_id 
       FROM carts 
       WHERE user_id = $1 AND status = 'aberto'`, [userId]
    );

    if (cartResult.rows.length === 0) {
      return { error: 'Carrinho não encontrado ou fechado.' };
    }

    const cartId = cartResult.rows[0].cart_id;

    // 2. Remover o item do carrinho
    const result = await pool.query(
      `DELETE FROM cart_items 
       WHERE cart_id = $1 AND product_id = $2 
       RETURNING id, product_id`, [cartId, productId]
    );

    if (result.rows.length === 0) {
      return { error: 'Produto não encontrado no carrinho.' };
    }

    return { message: 'Produto removido do carrinho.', product: result.rows[0] };

  } catch (error) {
    console.error(error);
    return { error: 'Erro ao remover o produto do carrinho.' };
  }
};




module.exports = {
  getOpenCartByUserId,
  createCart,
  removeProductFromCart,
  getCartItemsByUserId
};
