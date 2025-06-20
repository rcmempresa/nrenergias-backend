// controllers/authController.js
const { getAllEncomendas, getShippingAddressByOrderId } = require('../models/Encomendas'); // Importe a nova função

const listEncomendas = async (req, res) => {
  try {
    const orders = await getAllEncomendas();
    res.status(200).json(orders);
  } catch (err) {
    console.error('Erro ao listar as encomendas:', err);
    res.status(500).json({ error: 'Erro ao listar as encomendas' });
  }
};

// Novo controlador para obter o endereço de envio de uma encomenda específica
const getEncomendaShippingAddress = async (req, res) => {
  const { orderId } = req.params;
  try {
    const address = await getShippingAddressByOrderId(orderId);
    if (address) {
      res.status(200).json(address);
    } else {
      res.status(404).json({ error: 'Endereço de envio não encontrado para esta encomenda.' });
    }
  } catch (err) {
    console.error(`Erro ao buscar endereço de envio para a encomenda com ID ${orderId}:`, err);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar endereço de envio.' });
  }
};

module.exports = { 
  listEncomendas, 
  getEncomendaShippingAddress
};