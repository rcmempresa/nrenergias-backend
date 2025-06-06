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

// --- Template para a empresa com detalhes ---
const gerarEmailEmpresa = (orderId, order, items, user) => {
  const listaProdutosHtml = items.map(item => `
    <li>${item.product_name} - Quantidade: ${item.quantity} - Preço: €${item.price.toFixed(2)}</li>
  `).join('');

  return `
  <!DOCTYPE html>
  <html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <title>Encomenda paga</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); }
      h2 { color: #00723f; }
      p, li { font-size: 16px; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>📦 Encomenda #${orderId} foi paga!</h2>
      <p>A encomenda foi marcada como paga e está pronta para ser processada e enviada.</p>
      <p><strong>Total:</strong> €${order.total_amount.toFixed(2)}</p>
      <h3>Produtos:</h3>
      <ul>
        ${listaProdutosHtml}
      </ul>
      <p><strong>Cliente:</strong> ${user.full_name} (${user.email})</p>
      <p><strong>Endereço:</strong> ${order.shipping_address}</p>
      <p><strong>Telefone:</strong> ${order.phone}</p>
    </div>
  </body>
  </html>
  `;
};

// --- Template para o cliente com detalhes ---
const gerarEmailCliente = (orderId, order, items) => {
  const listaProdutosHtml = items.map(item => `
    <li>${item.product_name} - Quantidade: ${item.quantity} - Preço: €${item.price.toFixed(2)}</li>
  `).join('');

  return `
  <!DOCTYPE html>
  <html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <title>Pagamento recebido</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f8f8f8; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 20px auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); }
      h2 { color: #00723f; }
      p, li { font-size: 16px; }
      .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>✅ Pagamento confirmado!</h2>
      <p>Olá! Recebemos o pagamento da tua encomenda <strong>#${orderId}</strong>.</p>
      <p><strong>Produtos comprados:</strong></p>
      <ul>
        ${listaProdutosHtml}
      </ul>
      <p><strong>Total a pagar:</strong> €${order.total_amount.toFixed(2)}</p>
      <p>O teu pedido está agora a ser preparado para envio. Obrigado pela tua confiança!</p>
      <div class="footer">NRenergias • www.nrenergias.pt</div>
    </div>
  </body>
  </html>
  `;
};

// --- Handler principal ---
const notification = async (req, res) => {
  const notification = req.body;

  // Logs para debug
  console.log('Payload recebido:', notification);

  try {
    if (notification.status === 'success') {
      const orderId = notification.key;

      // Log do orderId extraído
      console.log('OrderId extraído:', orderId);

      if (orderId) {
        // Atualiza status para "pago" e retorna user_id e dados do envio
        const orderResult = await pool.query(
          `UPDATE orders SET payment_status = 'pago' WHERE id = $1 RETURNING id, user_id, total_amount, shipping_address, phone`,
          [orderId]
        );

        if (orderResult.rows.length === 0) {
          console.warn(`Pedido #${orderId} não encontrado.`);
          return res.status(404).send('Pedido não encontrado');
        }

        const order = orderResult.rows[0];
        console.log(`Pedido #${orderId} marcado como pago.`);

        // Buscar itens do pedido com nome do produto
        const itemsResult = await pool.query(
          `SELECT oi.product_id, oi.quantity, oi.price, p.name as product_name
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = $1`,
          [orderId]
        );
        const items = itemsResult.rows;

        // Buscar dados do cliente
        const userResult = await pool.query(
          "SELECT email, full_name FROM users WHERE id = $1",
          [order.user_id]
        );
        const user = userResult.rows[0];

        if (!user) {
          console.warn(`Usuário #${order.user_id} não encontrado.`);
        }

        // Email para empresa
        const empresaEmail = process.env.GMAIL_USER;
        await sendPaymentEmail(
          empresaEmail,
          `Encomenda #${orderId} foi paga!`,
          gerarEmailEmpresa(orderId, order, items, user)
        );

        // Email para cliente, se houver email
        if (user?.email) {
          await sendPaymentEmail(
            user.email,
            'A tua encomenda foi paga com sucesso, em breve receberás o teu produto!',
            gerarEmailCliente(orderId, order, items)
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
