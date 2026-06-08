// config/authConfig.js
module.exports = {
    secret_key: process.env.JWT_SECRET_KEY || 'nrenergias',
    expires_in: '1h',
};
  