// server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');

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

app.use(cookieParser());
app.use(cors({
  origin: 'https://www.nrenergias.pt',
  credentials: true,
}));
app.use(express.json());

// --- DEFINA O SEU CAMINHO DE UPLOAD ---
// ESTE DEVE CORRESPONDER AO 'Mount Path' QUE VOCÊ DEFINIU NO RAILWAY
const VOLUME_MOUNT_PATH = '/mnt/data'; // <-- ESCOLHA ESTE CAMINHO NO RAILWAY

// Onde as imagens serão realmente salvas dentro do volume persistente
const UPLOADS_SUBDIRECTORY = 'uploads';
const ABSOLUTE_UPLOAD_PATH = path.join(VOLUME_MOUNT_PATH, UPLOADS_SUBDIRECTORY);

// --- CONFIGURAÇÃO DO MULTER ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Assegura que o diretório de destino exista dentro do volume
    // O Multer deve criá-lo se não existir, mas você pode adicionar
    // fs.mkdirSync(ABSOLUTE_UPLOAD_PATH, { recursive: true }) se tiver problemas.
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

  // A URL que o frontend vai usar para acessar a imagem
  // O '/uploads' aqui é o prefixo URL que você quer no seu domínio,
  // não o caminho físico no disco.
  const imageUrl = `<span class="math-inline">\{process\.env\.BACKEND\_URL\}/</span>{UPLOADS_SUBDIRECTORY}/${req.file.filename}`;
  // console.log(`Imagem salva em: ${req.file.path}, URL gerada: ${imageUrl}`);

  res.status(200).json({ url: imageUrl });
});

// --- SERVIÇO DE ARQUIVOS ESTÁTICOS ---
// O prefixo '/uploads' na URL do navegador vai servir arquivos de ABSOLUTE_UPLOAD_PATH
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});