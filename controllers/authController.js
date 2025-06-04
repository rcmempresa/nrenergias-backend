// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/authConfig');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendPaymentEmail = async (to, subject, text, html) => {
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
    html,
  };

  await transporterGmail.sendMail(mailOptions);
  console.log(`Email enviado para: ${to}`);
};

const signup = async (req, res) => {
  const { nome, email, senha, endereco, telefone } = req.body;

  try {
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já registrado' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await User.createUser(nome, email, hashedPassword, endereco, telefone);

    const subject = 'Bem-vindo à nossa plataforma!';
    const text = `Olá ${nome}, obrigado por criar a sua conta! Desejamos-lhe umas ótimas compras!`;

    const html = `<!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bem-vindo à nossa plataforma!</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #0d6efd;
            color: #fff;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .content p {
            font-size: 16px;
            line-height: 1.5;
            margin: 15px 0;
          }
          .button {
            display: inline-block;
            margin-top: 20px;
            background-color: #0d6efd;
            color: #fff;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 4px;
          }
          .footer {
            background-color: #f1f1f1;
            color: #888;
            text-align: center;
            padding: 15px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo, ${nome}!</h1>
          </div>
          <div class="content">
            <p>Obrigado por se registar na nossa plataforma. Estamos muito felizes em tê-lo connosco!</p>
            <p>Agora pode explorar todos os nossos produtos e aproveitar os melhores preços.</p>
            <p>Se precisar de ajuda, entre em contacto connosco.</p>
            <a href="https://www.nrenergias.pt" class="button">Visitar o site</a>
          </div>
          <div class="footer">
            &copy; 2025 NR Energias. Todos os direitos reservados.
          </div>
        </div>
      </body>
      </html>`;

    await sendPaymentEmail(email, subject, text, html);

    return res.status(201).json({
      message: 'Utilizador criado com sucesso',
      user: { id: newUser.id, nome, email, telefone },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Utilizador ou password incorretos' });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Utilizador ou password incorretos' });
    }

    const token = jwt.sign({ userId: user.id }, authConfig.secret_key, { expiresIn: authConfig.expires_in });
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 3600000,
      domain: 'localhost',
    });

    return res.json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    return res.json({ message: 'Logout bem-sucedido' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({
      message: 'Você está autenticado!',
      userId: user.id,
      email: user.email,
      nome: user.nome,
      telefone: user.telefone,
    });
  } catch (err) {
    console.error('Erro ao buscar perfil do usuário:', err);
    return res.status(500).json({ message: 'Erro ao buscar perfil do usuário' });
  }
};

module.exports = { signup, login, logout, getProfile };
