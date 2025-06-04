const pool = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendPaymentEmail = async (to, subject, text) => {
  const transporterGmail = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
  };

  await transporterGmail.sendMail(mailOptions);
  console.log(`Email enviado para: ${to}`);
};

const notification = async (req, res) => {
  const notification = req.body;

  try {
    if (notification.status === 'success') {
      const orderId = notification.key;
      if (orderId) {
        // 1) Marca a encomenda como paga e obtém o user_id
        const result = await pool.query(
          "UPDATE orders SET payment_status = 'pago' WHERE id = $1 RETURNING user_id",
          [orderId]
        );

        console.log(`Pedido #${orderId} marcado como pago.`);

       
        const userId = result.rows[0]?.user_id;
        let clienteEmail;

        if (userId) {
          const userResult = await pool.query(
            "SELECT email FROM users WHERE id = $1",
            [userId]
          );

          clienteEmail = userResult.rows[0]?.email;
        }

        // 3) Envia email para a tua empresa
        const empresaEmail = process.env.GMAIL_USER;
        const empresaSubject = `Encomenda #${orderId} foi paga!`;
        const empresaText = `A encomenda #${orderId} foi paga e está pronta para envio.`;

        await sendPaymentEmail(empresaEmail, empresaSubject, empresaText);

        // 4) Envia email para o cliente, se existir
        if (clienteEmail) {
          const clienteSubject = 'A tua encomenda foi paga!';
          const clienteText = `Olá! A tua encomenda #${orderId} foi paga e está pronta para envio. Obrigado pela compra!`;

          await sendPaymentEmail(clienteEmail, clienteSubject, clienteText);
        } else {
          console.warn(`Nenhum email de cliente encontrado para o pedido #${orderId}.`);
        }
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
