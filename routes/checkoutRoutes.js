const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const authenticate = require('../middleware/authMiddleware'); 

// Rota para adicionar checkout
router.post('/add', authenticate, checkoutController.handleCheckout);

module.exports = router;
