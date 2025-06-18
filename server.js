// server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');  

// --- IMPORTAR SUAS ROTAS EXISTENTES ---
const productRoutes = require('./routes/productRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
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

// Ativar CORS: Importante que 'origin' seja o URL do seu frontend
app.use(cors({
  origin: 'https://www.nrenergias.pt', // O domínio exato do seu frontend
  credentials: true,
}));

// Middleware para permitir JSON nas requisições
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Erro: Apenas imagens (jpeg, jpg, png, gif, webp) são permitidas!'), false);
  }
});


app.post('/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo de imagem foi enviado.' });
  }
  const imageUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;

  res.status(200).json({ url: imageUrl });
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/products', productRoutes);
app.use('/services', servicesRoutes);
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

// Rota de Teste (opcional)
/*
app.get('/', (req, res) => {
  res.send('Servidor Backend funcionando!');
});*/

// --- INÍCIO DO SERVIDOR ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});