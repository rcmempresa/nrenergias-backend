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
  subject: 'Dados para pagamento - Cartão de Crédito',
  text: `Olá ${paymentData.customer_name || ''},\n\nPara concluir o pagamento com o seu cartão de crédito, por favor utilize o link seguro abaixo:\n\n${paymentData.url}\n\nObrigado pela sua compra!`,
  html: `
    <p>Olá ${paymentData.customer_name || ''},</p>
    <p>Para concluir o pagamento com o seu cartão de crédito, por favor utilize o link seguro abaixo:</p>
    <p><a href="${paymentData.url}" style="color: #1a73e8; text-decoration: underline;">Clique aqui para efetuar o pagamento</a></p>
    <p>Obrigado pela sua compra!</p>
  `,
};



  await transporterGmail.sendMail(mailOptions);
};

const handleCheckout = async (req, res) => {
  try {
   
    const { customer, key, value, capture } = req.body;

    const body = {
      currency: 'EUR',
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        phone_indicative: customer.phone_indicative
      },
      key,
      value,
      type: 'sale', // tipo de operação
      method: 'cc', // método cc
      capture
    };

  
    const response = await fetch('https://api.test.easypay.pt/2.0/single', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        AccountId: '474fc341-a2c9-4b4e-a9c9-da669b273591',
        ApiKey: '9dcefa96-cbc9-4088-bffd-05e4cd5b6800'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    const paymentData = {
      customer_name: customer.name,
      url: data.method.url
    };
    
    await sendPaymentEmail(customer.email, paymentData);
    res.json(data);

  } catch (error) {
    console.error('Erro ao criar referência CC:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

module.exports = { handleCheckout };

