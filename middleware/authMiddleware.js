const jwt = require('jsonwebtoken');
const authConfig = require('../config/authConfig');

const authenticate = (req, res, next) => {
  let token = req.cookies.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, authConfig.secret_key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }

    // Verifica se o email é permitido
    if (decoded.email !== 'geral@nrenergias.pt') {
      return res.status(403).json({ message: 'Acesso restrito à administração' });
    }

    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  });
};

module.exports = authenticate;
