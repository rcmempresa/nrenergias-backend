const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.listarProdutos);
router.put('/atualizar/:id',productController.atualizarProduto);
router.get('/:id', productController.listarProdutoPorId);
router.get('/stock/:id',productController.verificarEstoque);
router.post('/adicionar', productController.adicionarProduto);
router.delete('/eliminar/:id', productController.eliminarProduto);

module.exports = router;
