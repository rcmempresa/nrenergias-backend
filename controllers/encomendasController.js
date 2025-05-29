// controllers/authController.js
const {getAllEncomendas} = require('../models/Encomendas');

const listEncomendas = async (req, res) => {
  try {
    const orders = await getAllEncomendas(); 
    res.status(200).json(orders); 
  } catch (err) {
    console.error('Erro ao listar as encomendas:', err);
    res.status(500).json({ error: 'Erro ao listar as encomendas' });
  }
};

module.exports = { listEncomendas};
