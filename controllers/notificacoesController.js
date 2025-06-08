const pool = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// --- Envio de email ---
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

// --- Gera tabela de produtos em HTML ---
const gerarTabelaProdutos = (items) => {
  if (!items || items.length === 0) return '<p>Nenhum produto encontrado.</p>';

  const rows = items.map(item => {
    const price = Number(item.price);
    const total = Number(item.total);

    return `
      <tr>
        <td>${item.product_name}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">€${price.toFixed(2)}</td>
        <td style="text-align: right;">€${total.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  return `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 20px;">
      <thead style="background-color: #0080ff; color: white;">
        <tr>
          <th>Produto</th>
          <th>Quantidade</th>
          <th>Preço Unitário</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

// --- Gera HTML da morada de envio ---
const gerarMoradaHtml = (morada) => {
  if (!morada) return '<p><strong>Morada:</strong> Não disponível.</p>';

  return `
    <div style="margin-top: 20px;">
      <h3>📍 Detalhes de envio</h3>
      <p><strong>Morada:</strong> ${morada.address}</p>
      <p><strong>Cidade:</strong> ${morada.city}</p>
      <p><strong>Código Postal:</strong> ${morada.zip_code}</p>
      <p><strong>Telefone:</strong> ${morada.phone}</p>
    </div>
  `;
};

// --- Template para email da empresa ---
const gerarEmailEmpresa = (orderId, tabelaProdutosHtml, moradaHtml) => `
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
    ${tabelaProdutosHtml}
    ${moradaHtml}
    <p>Verifique no sistema e prepare o envio.</p>
  </div>
</body>
</html>
`;

// --- Template para o cliente ---
const gerarEmailCliente = (orderId, tabelaProdutosHtml, moradaHtml) => `
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
    ${tabelaProdutosHtml}
    ${moradaHtml}
    <p>O teu pedido está agora a ser preparado para envio. Obrigado pela tua confiança!</p>
    <div class="footer">NRenergias • www.nrenergias.pt</div>
  </div>
</body>
</html>
`;

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
        const result = await pool.query(
          "UPDATE orders SET payment_status = 'pago' WHERE id = $1 RETURNING user_id",
          [orderId]
        );

        console.log(`Pedido #${orderId} marcado como pago.`);

        const userId = result.rows[0]?.user_id;
        let clienteEmail = null;

      
        if (userId) {
          const userResult = await pool.query(
            "SELECT email FROM users WHERE id = $1",
            [userId]
          );
          clienteEmail = userResult.rows[0]?.email;
        }

        
        const itemsResult = await pool.query(
        `SELECT 
          COALESCE(p.nome, oi.description, 'Item sem descrição') AS product_name,
          oi.quantity,
          oi.price,
          oi.total
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1`,
        [orderId]
      );

      const items = itemsResult.rows;
      const tabelaHtml = gerarTabelaProdutos(items);


        
        const shippingResult = await pool.query(
          `SELECT address, city, zip_code, phone 
           FROM shipping_details 
           WHERE order_id = $1`,
          [orderId]
        );

        const shipping = shippingResult.rows[0];
        const moradaHtml = gerarMoradaHtml(shipping);

        // 5) Email para empresa
        const empresaEmail = process.env.GMAIL_USER;
        await sendPaymentEmail(
          empresaEmail,
          `Encomenda #${orderId} foi paga!`,
          gerarEmailEmpresa(orderId, tabelaHtml, moradaHtml)
        );

        // 6) Email para cliente
        if (clienteEmail) {
          await sendPaymentEmail(
            clienteEmail,
            'A tua encomenda foi paga com sucesso, em breve receberás o teu produto!',
            gerarEmailCliente(orderId, tabelaHtml, moradaHtml)
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
