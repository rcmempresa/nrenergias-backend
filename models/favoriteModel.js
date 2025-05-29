const pool = require('../config/db');

// Função para adicionar um produto aos favoritos
const addFavorite = async (user_id, produto_id) => {
  try {
    // Verifica se o produto já está nos favoritos
    const queryCheck = 'SELECT 1 FROM favorites WHERE user_id = $1 AND produto_id = $2';
    const checkResult = await pool.query(queryCheck, [user_id, produto_id]);

    if (checkResult.rows.length > 0) {
      throw new Error('Produto já está nos favoritos.');
    }

    // Adiciona o produto aos favoritos
    const queryInsert = 'INSERT INTO favorites (user_id, produto_id) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(queryInsert, [user_id, produto_id]);

    return result.rows[0];
  } catch (error) {
    console.error('Erro ao adicionar aos favoritos:', error);
    throw error;
  }
};

// Função para remover um produto dos favoritos
const removeFavorite = async (userId, produtoId) => {
  try {
    // Remove o produto dos favoritos
    const queryDelete = 'DELETE FROM favorites WHERE user_id = $1 AND produto_id = $2 RETURNING *';
    const result = await pool.query(queryDelete, [userId, produtoId]);

    if (result.rows.length === 0) {
      throw new Error('Favorito não encontrado.');
    }

    return result.rows[0]; // Retorna o favorito removido
  } catch (error) {
    console.error('Erro ao remover dos favoritos:', error);
    throw error;
  }
};

// Função para listar os favoritos de um usuário
const getFavorites = async (userId) => {
  try {
    // Busca os favoritos do usuário
    const querySelect = `
      SELECT f.user_id, f.produto_id, p.nome AS produto_nome, p.imagem_url 
      FROM favorites f
      JOIN products p ON f.produto_id = p.id
      WHERE f.user_id = $1
    `;
    const result = await pool.query(querySelect, [userId]);

    if (result.rows.length === 0) {
      return { error: 'Nenhum favorito encontrado.' };
    }

    return result.rows; // Retorna a lista de favoritos
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    throw error;
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites
};
