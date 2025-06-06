const checkoutModel = require('../models/checkoutModel');
const pool = require('../config/db');

const handleCheckout = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { shipping_details, order } = req.body;
    const user_id = req.userId;
    const { items, total_amount } = order;

    const orderId = await checkoutModel.createOrder(client, user_id, total_amount);
    await checkoutModel.createShippingDetails(client, orderId, shipping_details);
    await checkoutModel.createOrderItems(client, orderId, items); 

    await client.query('COMMIT');
    res.status(201).json({ message: 'Checkout concluído com sucesso', order_id: orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro no checkout:', error);
    res.status(500).json({ error: 'Erro ao processar o checkout' });
  } finally {
    client.release();
  }
};

  
  
  
module.exports = {
  handleCheckout,
};
