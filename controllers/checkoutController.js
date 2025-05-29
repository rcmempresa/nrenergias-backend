const checkoutModel = require('../models/checkoutModel');
const pool = require('../config/db');

const handleCheckout = async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { shipping_details, order } = req.body;
      const user_id = req.userId;
      
      // Cria a ordem
      const orderId = await checkoutModel.createOrder(user_id, order.total_amount);
  
      // Cria os detalhes de envio
      await checkoutModel.createShippingDetails(orderId, shipping_details);
  
      // Retorna sucesso
      res.status(201).json({ message: 'Checkout concluído com sucesso', order_id: orderId });
    } catch (error) {
      // Se ocorrer um erro, desfaz as alterações
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
