const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/notificacoesController'); 

// Rota para adicionar checkout
router.post('/notifications',  notificacoesController.notification);

module.exports = router;
