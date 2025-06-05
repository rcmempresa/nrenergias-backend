const pool = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// --- Função para envio de email com HTML ---
const sendPaymentEmail = async (to, subject, html) => {
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
    html,
  };

  await transporterGmail.sendMail(mailOptions);
  console.log(`Email enviado para: ${to}`);
};

// --- Template para a empresa ---
const gerarEmailEmpresa = (orderId) => `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <title>Encomenda paga</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); }
    h2 { color: #00723f; }
    p { font-size: 16px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <h2>📦 Encomenda #${orderId} foi paga!</h2>
    <p>A encomenda com ID <strong>#${orderId}</strong> foi marcada como paga e está pronta para ser processada e enviada.</p>
    <p>Verifique no sistema e prepare o envio.</p>
  </div>
</body>
</html>
`;

// --- Template para o cliente ---
const gerarEmailCliente = (orderId) => `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <title>Pagamento recebido</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f8f8f8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); }
    h2 { color: #00723f; }
    p { font-size: 16px; }
    .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h2>✅ Pagamento confirmado!</h2>
    <p>Olá! Recebemos o pagamento da tua encomenda <strong>#${orderId}</strong>.</p>
    <p>O teu pedido está agora a ser preparado para envio. Obrigado pela tua confiança!</p>
    <div class="footer">NRenergias • www.nrenergias.pt</div>
  </div>
</body>
</html>
`;

// --- Handler principal ---
const notification = async (req, res) => {
  const notification = req.body;

  try {
    if (notification.status === 'success') {
      const orderId = notification.key;

      if (orderId) {
        // 1) Atualiza status para "pago"
        const result = await pool.query(
          "UPDATE orders SET payment_status = 'pago' WHERE id = $1 RETURNING user_id",
          [orderId]
        );

        console.log(`Pedido #${orderId} marcado como pago.`);

        const userId = result.rows[0]?.user_id;
        let clienteEmail;

        // 2) Busca email do cliente
        if (userId) {
          const userResult = await pool.query(
            "SELECT email FROM users WHERE id = $1",
            [userId]
          );

          clienteEmail = userResult.rows[0]?.email;
        }

        // 3) Email para empresa
        const empresaEmail = process.env.GMAIL_USER;
        await sendPaymentEmail(
          empresaEmail,
          `Encomenda #${orderId} foi paga!`,
          gerarEmailEmpresa(orderId)
        );

        // 4) Email para cliente, se houver
        if (clienteEmail) {
          await sendPaymentEmail(
            clienteEmail,
            'A tua encomenda foi paga com sucesso!',
            gerarEmailCliente(orderId)
          );
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
