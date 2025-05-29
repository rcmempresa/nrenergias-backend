const favoriteModel = require('../models/favoriteModel');

const addFavorite = async (req, res) => {
  const { produto_id } = req.body;
  const user_id = req.userId;

  try {
    // Chama a função do model para adicionar aos favoritos
    const favorite = await favoriteModel.addFavorite(user_id, produto_id);
    
    // Retorna a resposta com o favorito recém-adicionado
    return res.status(201).json({
      message: 'Produto adicionado aos favoritos com sucesso!',
      favorite
    });
  } catch (error) {
    console.error('Erro ao adicionar aos favoritos:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Função para remover um produto dos favoritos
const removeFavorite = async (req, res) => {
  const { user_id, produto_id } = req.body;

  try {
    // Chama a função do model para remover dos favoritos
    const removedFavorite = await favoriteModel.removeFavorite(user_id, produto_id);
    
    // Retorna a resposta com o favorito removido
    return res.status(200).json({
      message: 'Produto removido dos favoritos com sucesso!',
      removedFavorite
    });
  } catch (error) {
    console.error('Erro ao remover dos favoritos:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Função para listar os favoritos de um usuário
const getFavorites = async (req, res) => {
  const { user_id } = req.params;

  try {
    // Chama a função do model para listar os favoritos
    const favorites = await favoriteModel.getFavorites(user_id);
    
    if (favorites.error) {
      return res.status(404).json({ message: favorites.error });
    }

    // Retorna a lista de favoritos
    return res.status(200).json({
      message: 'Favoritos recuperados com sucesso!',
      favorites
    });
  } catch (error) {
    console.error('Erro ao listar favoritos:', error);
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites
};
