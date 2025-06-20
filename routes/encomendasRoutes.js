const express = require('express');
// Importa o controlador que agora tem a função para buscar o endereço de envio
const { listEncomendas, getEncomendaShippingAddress } = require('../controllers/encomendasController');
const router = express.Router();

// Rota para listar todas as encomendas
router.get('/listar', listEncomendas);

// Rota para obter o endereço de envio de uma encomenda específica
// Usamos ':orderId' para deixar claro que o parâmetro é o ID da encomenda
router.get('/listar/:orderId/endereco', getEncomendaShippingAddress);


module.exports = router;