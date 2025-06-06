const checkoutModel = require('../models/checkoutModel');
const pool = require('../config/db');

const handleCheckout = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { shipping_details, order } = req.body;
    const user_id = req.userId;
    const { items, total_amount } = order;

    // Validações básicas:
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Lista de items inválida ou vazia.');
    }
    if (!total_amount || isNaN(total_amount)) {
      throw new Error('total_amount inválido.');
    }

    const orderId = await checkoutModel.createOrder(client, user_id, total_amount);
    await checkoutModel.createShippingDetails(client, orderId, shipping_details);
    await checkoutModel.createOrderItems(client, orderId, items);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Checkout concluído com sucesso', order_id: orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro no checkout:', error.stack || error);
    console.error('Dados recebidos:', JSON.stringify(req.body, null, 2));
    res.status(500).json({ error: 'Erro ao processar o checkout', details: error.message });
  } finally {
    client.release();
  }
};



  
  
  
module.exports = {
  handleCheckout,
};
