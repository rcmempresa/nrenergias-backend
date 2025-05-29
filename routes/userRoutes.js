const express = require('express');
const { listUsers, getUser, createUserHandler } = require('../controllers/userController');
const router = express.Router();

// Rota para listar todos os usuários
router.get('/listar', listUsers);


module.exports = router;

