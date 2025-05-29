const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const authenticate = require('../middleware/authMiddleware'); 

// Adicionar aos favoritos
router.post('/add', authenticate, favoritesController.addFavorite);

// Remover dos favoritos
router.delete('/remove', authenticate, favoritesController.removeFavorite);

// Listar os favoritos de um usuário
router.get('/:user_id', authenticate, favoritesController.getFavorites);

module.exports = router;
