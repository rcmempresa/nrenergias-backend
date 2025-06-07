const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.get('/', serviceController.listarServicos);
router.get('/:id', serviceController.listarServicosPorId);
router.post('/adicionar', serviceController.adicionarServico);
router.delete('/eliminar/:id', serviceController.eliminarServico);

module.exports = router;
