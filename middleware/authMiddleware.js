const jwt = require('jsonwebtoken');
const authConfig = require('../config/authConfig');

const authenticate = (req, res, next) => {
  let token = req.cookies.token; // Primeiro, tenta pegar dos cookies

  if (!token) {
    // Se não encontrar nos cookies, tenta pegar do header Authorization
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

    req.userId = decoded.userId;
    next();
  });
};

module.exports = authenticate;
