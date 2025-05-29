const nodemailer = require('nodemailer');
require('dotenv').config();

// Transporter para Gmail (cliente → proprietário)
const transporterGmail = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Transporter para confirmação (plataforma → cliente)
const transporterConfirmacao = nodemailer.createTransport({
  host: 'webdomain03.dnscpanel.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.CONFIRMATION_EMAIL_USER,
    pass: process.env.CONFIRMATION_EMAIL_PASS,
  },
});

// Função enviar
const enviar = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  try {
    // 1. Email do cliente para o proprietário
    await transporterGmail.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.GMAIL_USER,
      subject: 'Nova mensagem do site',
      html: `
        <h2>Nova mensagem de contato</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
      `,
    });

    // 2. Email de confirmação automática para o cliente
    await transporterConfirmacao.sendMail({
      from: `"1way" <${process.env.CONFIRMATION_EMAIL_USER}>`,
      to: email,
      subject: 'Recebemos sua mensagem!',
      html: `
        <h2>Olá ${name},</h2>
        <p>Obrigado por entrar em contacto com a 1way. Recebemos a sua mensagem e entraremos em contacto brevemente.</p>
        <p><em>Resumo da sua mensagem:</em></p>
        <p>${message}</p>
        <br />
        <p>Com os melhores cumprimentos,</p>
        <p>Equipa 1way</p>
      `,
    });

    res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso.' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao enviar a mensagem.' });
  }
};

module.exports = { enviar };
