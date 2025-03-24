const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Configuração do Pool de Conexão com PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Verificar a conexão com o banco
pool.connect()
  .then(() => console.log('Conexão com o PostgreSQL bem-sucedida!'))
  .catch(err => console.error('Erro ao conectar ao banco de dados', err));

// Middleware para permitir JSON nas requisições
app.use(express.json());

// Rota de Teste
app.get('/', (req, res) => {
  res.send('Servidor Backend funcionando!');
});

// Exemplo de rota para buscar produtos (ajuste conforme necessário)
app.get('/produtos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar produtos');
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
