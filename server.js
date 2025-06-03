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
const pagamentoMbway = require('./routes/pagamentoMbway');
const pagamentoCC = require('./routes/pagamentoCC');
const notificacoes = require('./routes/notificacoes');

require('dotenv').config();

const app = express();

// Usar o cookie-parser para acessar os cookies
app.use(cookieParser());

// Ativar CORS para todas as origens (apenas para desenvolvimento)
// Ou, se você quiser limitar as origens permitidas:
app.use(cors({
  origin: 'https://nrenergias-frontend-j1ftlp03h.vercel.app',
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
app.use('/api/referencia/mbway',pagamentoMbway);
app.use('/api/referencia/cc',pagamentoCC);
app.use('/api/easypay',notificacoes);
/*app.post('/api/easypay/notifications', async (req, res) => {
  const notification = req.body;
  console.log('Payload da notificação:', notification);

  try {
    // Confirma se o pagamento foi concluído com sucesso
    if (notification.status === 'success') {
      const orderId = notification.key;  // pega o ID do pedido

      if (orderId) {
        await pool.query(
          "UPDATE orders SET payment_status = 'pago' WHERE id = $1",
          [orderId]
        );
        console.log(`Pedido #${orderId} marcado como pago.`);
      } else {
        console.warn('ID do pedido não encontrado na notificação.');
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro ao processar notificação de pagamento:', error);
    res.status(500).send('Erro no servidor');
  }
});*/



// Rota de Teste
/*
app.get('/', (req, res) => {
  res.send('Servidor Backend funcionando!');
});*/

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
