const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendPaymentEmail = async (to, paymentData) => {
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
    from: '"Nrenergias" <no-reply@nrnergias.pt>',
    to: to,
    subject: 'Dados para pagamento - Multibanco',
    text: `Olá ${paymentData.customer_name || ''},\n\nSegue abaixo a referência Multibanco para pagamento:\nEntidade: ${paymentData.entity}\nReferência: ${paymentData.reference}\nValor: ${paymentData.value}€\n\nObrigado pela sua compra!`,
    html: `
      <p>Olá ${paymentData.customer_name || ''},</p>
      <p>Aqui está a sua referência Multibanco:</p>
      <ul>
        <li><strong>Entidade:</strong> ${paymentData.entity}</li>
        <li><strong>Referência:</strong> ${paymentData.reference}</li>
        <li><strong>Valor:</strong> ${Number(paymentData.value).toFixed(2)}€</li>
      </ul>
      <p>Obrigado pela sua compra!</p>
    `,
  };

  await transporterGmail.sendMail(mailOptions);
};

const handleCheckout = async (req, res) => {
  try {
    const { customer, key, value, capture } = req.body;

    // Faz a requisição para a API Easypay
    const response = await fetch('https://api.test.easypay.pt/2.0/single', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        AccountId: '474fc341-a2c9-4b4e-a9c9-da669b273591',
        ApiKey: '9dcefa96-cbc9-4088-bffd-05e4cd5b6800',
      },
      body: JSON.stringify({
        customer,
        key,
        value,
        method: 'mb',
        capture,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
  

    const paymentData = {
      customer_name: customer.name,
      entity: data.method.entity,
      reference: data.method.reference,
      value: value,
    };
    await sendPaymentEmail(customer.email, paymentData);

    res.json(data);
  } catch (error) {
    console.error('Erro ao criar referência Multibanco:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

module.exports = {
  handleCheckout,
  sendPaymentEmail,
};
