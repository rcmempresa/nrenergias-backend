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

// Template HTML profissional para o cliente
const gerarTemplateConfirmacao = (name, message) => `
<!DOCTYPE html>
<html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <title>Confirmação de Mensagem</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .email-header {
        background-color: #00723f;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .email-body {
        padding: 30px;
        color: #333333;
        line-height: 1.6;
      }
      .email-body p {
        margin-bottom: 16px;
      }
      .email-footer {
        background-color: #f0f0f0;
        text-align: center;
        padding: 20px;
        font-size: 13px;
        color: #888888;
      }
      .brand {
        font-weight: bold;
        color: #00723f;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #00723f;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 4px;
        margin-top: 20px;
      }
      .message-box {
        background-color: #f9f9f9;
        border-left: 4px solid #00723f;
        padding: 15px;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1>NRenergias</h1>
        <p>Recebemos a sua mensagem!</p>
      </div>
      <div class="email-body">
        <p>Olá <strong>${name}</strong>,</p>
        <p>Obrigado por entrar em contacto com a <span class="brand">NRenergias</span>. A sua mensagem foi recebida com sucesso e será analisada pela nossa equipa.</p>
        <p>Entretanto, aqui está um resumo do que nos enviou:</p>
        <div class="message-box">
          ${message}
        </div>
        <p>Responderemos o mais brevemente possível. Agradecemos a sua confiança!</p>
        <a href="https://www.nrenergias.pt" class="button">Visitar o nosso site</a>
      </div>
      <div class="email-footer">
        © ${new Date().getFullYear()} NRenergias • Todos os direitos reservados
      </div>
    </div>
  </body>
</html>
`;

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
        <h2>Nova mensagem de contacto!</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
      `,
    });

    // 2. Email de confirmação automática para o cliente
    const htmlConfirmacao = gerarTemplateConfirmacao(name, message);

    await transporterConfirmacao.sendMail({
      from: `"NRenergias" <${process.env.CONFIRMATION_EMAIL_USER}>`,
      to: email,
      subject: 'Recebemos a sua mensagem!',
      html: htmlConfirmacao,
    });

    res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso.' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao enviar a mensagem.' });
  }
};

module.exports = { enviar };
