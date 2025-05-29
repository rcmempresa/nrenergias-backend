const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');


// Enviar mensagem ao proprietário
router.post('/enviar', contactController.enviar);


module.exports = router;
