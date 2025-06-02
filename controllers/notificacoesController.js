const pool = require('../config/db');

const notification = async (req, res) => {
  const notification = req.body;

  try {
    if (notification.status === 'success') {
      const orderId = notification.key;
      if (orderId) {
        await pool.query(
          "UPDATE orders SET payment_status = 'pago' WHERE id = $1",
          [orderId]
        );
        console.log(`Pedido #${orderId} marcado como pago.`);
      } else {
        console.warn('ID do pedido não encontrado na notificação.');
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro ao processar notificação de pagamento:', error);
    res.status(500).send('Erro no servidor');
  }
};

module.exports = { notification };

