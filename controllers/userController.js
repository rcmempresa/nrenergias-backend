// controllers/authController.js
const {getAllUsers} = require('../models/User');

const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers(); 
    res.status(200).json(users); 
  } catch (err) {
    console.error('Erro ao listar os usuários:', err);
    res.status(500).json({ error: 'Erro ao listar os usuários' });
  }
};

module.exports = { listUsers};
