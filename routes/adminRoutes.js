const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');

router.get('/admin', authenticate, (req, res) => {
  res.json({ message: `Bem-vindo à área administrativa, ${req.email}` });
});
