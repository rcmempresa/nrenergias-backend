// server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require ('./routes/checkoutRoutes');
const checkoutRoutesEasyPay = require ('./routes/checkoutRoutesEasyPay');
const favoriteRoutes = require ('./routes/favoriteRoutes');
const contactRoutes = require ('./routes/contactRoutes');
const userRoutes = require ('./routes/userRoutes');
const encomendasRoutes = require('./routes/encomendasRoutes');
const pagamentoMultibanco = require('./routes/pagamentoMultibanco');

require('dotenv').config();

const app = express();

// Usar o cookie-parser para acessar os cookies
app.use(cookieParser());

// Ativar CORS para todas as origens (apenas para desenvolvimento)
// Ou, se você quiser limitar as origens permitidas:
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));

// Middleware para permitir JSON nas requisições
app.use(express.json());



//rotas
app.use('/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/carrinho', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/favoritos',favoriteRoutes);
app.use('/api/contacto',contactRoutes);
app.use('/api/users',userRoutes);
app.use('/api/encomendas',encomendasRoutes);
app.use('/api/checkout/easypay',checkoutRoutesEasyPay);
app.use('/api/referencia/multibanco',pagamentoMultibanco);

// Rota de Teste
/*
app.get('/', (req, res) => {
  res.send('Servidor Backend funcionando!');
});*/

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
