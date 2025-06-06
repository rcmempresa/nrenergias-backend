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
const gerarEmailEmpresa = (orderId, orderDetails) => {
  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td>${item.product_id}</td>
      <td>${item.quantity}</td>
      <td>€${item.price.toFixed(2)}</td>
    </tr>
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
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #00723f; color: white; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>📦 Encomenda #${orderId} foi paga!</h2>
      <p>A encomenda com ID <strong>#${orderId}</strong> foi marcada como paga e está pronta para ser processada e enviada.</p>
      <h3>Detalhes da encomenda:</h3>
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Preço</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p><strong>Total: €${orderDetails.total_amount.toFixed(2)}</strong></p>
      <h3>Detalhes de envio:</h3>
      <p>
        Nome: ${orderDetails.shipping_details.full_name}<br/>
        Morada: ${orderDetails.shipping_details.address}<br/>
        Cidade: ${orderDetails.shipping_details.city}<br/>
        Código Postal: ${orderDetails.shipping_details.zip_code}<br/>
        País: ${orderDetails.shipping_details.country}<br/>
        Telefone: ${orderDetails.shipping_details.phone}<br/>
        NIF: ${orderDetails.shipping_details.nif || 'N/A'}
      </p>
      <h3>Método de pagamento:</h3>
      <p>${orderDetails.payment_method}</p>
      <p>Verifique no sistema e prepare o envio.</p>
    </div>
  </body>
  </html>
  `;
};

// --- Template para o cliente ---
const gerarEmailCliente = (orderId, orderDetails) => {
  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td>${item.product_id}</td>
      <td>${item.quantity}</td>
      <td>€${item.price.toFixed(2)}</td>
    </tr>
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
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #00723f; color: white; }
      .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>✅ Pagamento confirmado!</h2>
      <p>Olá! Recebemos o pagamento da tua encomenda <strong>#${orderId}</strong>.</p>
      <h3>Detalhes da encomenda:</h3>
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Preço</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p><strong>Total: €${orderDetails.total_amount.toFixed(2)}</strong></p>
      <h3>Detalhes de envio:</h3>
      <p>
        Nome: ${orderDetails.shipping_details.full_name}<br/>
        Morada: ${orderDetails.shipping_details.address}<br/>
        Cidade: ${orderDetails.shipping_details.city}<br/>
        Código Postal: ${orderDetails.shipping_details.zip_code}<br/>
        País: ${orderDetails.shipping_details.country}<br/>
        Telefone: ${orderDetails.shipping_details.phone}<br/>
        NIF: ${orderDetails.shipping_details.nif || 'N/A'}
      </p>
      <div class="footer">NRenergias • www.nrenergias.pt</div>
    </div>
  </body>
  </html>
  `;
};

// --- Handler principal ---
const notification = async (req, res) => {
  const notification = req.body;

  console.log('Payload recebido:', notification);

  try {
    if (notification.status === 'success') {
      const orderId = notification.key;
      console.log('OrderId extraído:', orderId);

      if (orderId) {
        // 1) Atualiza status para "pago"
        await pool.query(
          "UPDATE orders SET payment_status = 'pago' WHERE id = $1",
          [orderId]
        );

        // 2) Busca email do cliente
        const userResult = await pool.query(
          "SELECT email FROM users WHERE id = (SELECT user_id FROM orders WHERE id = $1)",
          [orderId]
        );
        const clienteEmail = userResult.rows[0]?.email;

        // 3) Obter detalhes do pedido do payload
        const orderDetails = notification.order;

        // 4) Email para empresa
        const empresaEmail = process.env.GMAIL_USER;
        await sendPaymentEmail(
          empresaEmail,
          `Encomenda #${orderId} foi paga!`,
          gerarEmailEmpresa(orderId, orderDetails)
        );

        // 5) Email para cliente, se houver email
        if (clienteEmail) {
          await sendPaymentEmail(
            clienteEmail,
            'A tua encomenda foi paga com sucesso, em breve receberás o teu produto!',
            gerarEmailCliente(orderId, orderDetails)
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
