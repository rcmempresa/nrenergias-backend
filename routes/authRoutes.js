// routes/authRoutes.js
const express = require('express');
const { signup, login, logout , getProfile} = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

// Rota de registo do utilizador
router.post('/signup', signup);

// Rota de login do utilizador
router.post('/login', login);

// Rota de logout do utilizador
router.post('/logout', logout); 

router.get('/profile', authenticate, getProfile);

module.exports = router;
