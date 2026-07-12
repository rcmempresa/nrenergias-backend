// server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Importar o módulo 'fs' para criar diretórios

// Suas rotas existentes
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
const categoryRoutes = require('./routes/categoryRoutes');

require('dotenv').config();

const app = express();

app.use(cookieParser());

app.use(cors({
  origin: [
    'https://loja.nrtechsolucion.pt',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
}));

app.use(express.json());

// --- DEFINA O SEU CAMINHO DE UPLOAD ---
// ESTE DEVE CORRESPONDER EXATAMENTE AO 'Mount Path' QUE VOCÊ DEFINIU NO RAILWAY
const VOLUME_MOUNT_PATH = process.env.VOLUME_MOUNT_PATH || path.join(__dirname, 'data');

// Onde as imagens serão realmente salvas dentro do volume persistente
const UPLOADS_SUBDIRECTORY = 'uploads';
const ABSOLUTE_UPLOAD_PATH = path.join(VOLUME_MOUNT_PATH, UPLOADS_SUBDIRECTORY);

// --- Crie o diretório de uploads se ele não existir ---
// Isso é importante para garantir que o Multer tenha onde escrever
if (!fs.existsSync(ABSOLUTE_UPLOAD_PATH)) {
    fs.mkdirSync(ABSOLUTE_UPLOAD_PATH, { recursive: true });
    console.log(`Diretório de uploads criado: ${ABSOLUTE_UPLOAD_PATH}`);
}

// --- CONFIGURAÇÃO DO MULTER ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, ABSOLUTE_UPLOAD_PATH);
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

// --- ROTA PARA UPLOAD DE IMAGENS ---
app.post('/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo de imagem foi enviado.' });
  }

  const imageUrl = `${process.env.BACKEND_URL}/${UPLOADS_SUBDIRECTORY}/${req.file.filename}`;
  console.log(`Imagem salva em: ${req.file.path}, URL gerada: ${imageUrl}`); // Mantenha para depuração

  res.status(200).json({ url: imageUrl });
});

// --- SERVIÇO DE ARQUIVOS ESTÁTICOS ---
app.use(`/${UPLOADS_SUBDIRECTORY}`, express.static(ABSOLUTE_UPLOAD_PATH));

// --- SUAS ROTAS EXISTENTES ---
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
app.use('/api/categories', categoryRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});