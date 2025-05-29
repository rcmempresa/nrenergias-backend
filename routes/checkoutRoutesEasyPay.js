const express = require('express');
const router = express.Router();
const checkoutControllerEasyPay = require('../controllers/checkoutController');

// Rota para adicionar checkout
router.post('/add', checkoutControllerEasyPay.handleCheckout);

module.exports = router;
