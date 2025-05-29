const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticate = require('../middleware/authMiddleware'); // Middleware para garantir que o usuário está autenticado

// Rota para adicionar um produto ao carrinho
router.post('/add', authenticate, cartController.addItemToCart);
// Rota para recuperar os itens do carrinho
router.get('/listar', authenticate, cartController.getCartItems);
//Rota para eliminar item do carrinho
router.delete('/remover/:id', authenticate, cartController.removeProduct);
//Rota para atualizar a quantidade do produto no carrinho de compras
router.post('/aumentar', cartController.increaseQuantity);
router.post('/diminuir', cartController.decreaseQuantity);
module.exports = router;
