const express = require('express');
const { listEncomendas } = require('../controllers/encomendasController');
const router = express.Router();

// Rota para listar todos os usuários
router.get('/listar', listEncomendas);


module.exports = router;

