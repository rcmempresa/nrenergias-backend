const express = require('express');
const router = express.Router();
const { listarCategorias, adicionarCategoria, eliminarCategoria } = require('../controllers/categoryController');

router.get('/', listarCategorias);
router.post('/adicionar', adicionarCategoria);
router.delete('/eliminar/:id', eliminarCategoria);

module.exports = router;
