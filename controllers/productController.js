const pool = require('../config/db'); // Importando a conexão com o banco

const verificarEstoque = async (req, res) => {
    try {
        const { id } = req.params; // Pegando o ID do produto da URL

        const query = 'SELECT estoque FROM products WHERE id = $1';
        const values = [id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Produto com ID ${id} não encontrado` });
        }

        // Verificando se o estoque é maior que zero
        if (result.rows[0].estoque > 0) {
            return res.json({ message: "Produto disponível em estoque" });
        } else {
            return res.status(404).json({ error: "Produto fora de estoque" });
        }

    } catch (err) {
        console.error("Erro ao verificar estoque:", err);
        return res.status(500).json({ error: "Erro ao verificar estoque", details: err.message });
    }
};


// Listar produtos
const listarProdutos = async (req, res) => {
    try {
        const { search } = req.query;

        let query = 'SELECT * FROM products WHERE estoque >= 1';
        let values = [];

        if (search) {
            query += ' AND LOWER(nome) LIKE LOWER($1)'; 
            values.push(`%${search}%`);
        }


        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao listar produtos:", err);
        res.status(500).json({ error: "Erro interno ao listar produtos", details: err.message });
    }
};


const listarProdutoPorId = async (req, res) => {
    try {
        const { id } = req.params; // Pegando o ID do produto da URL

        // Consultar produto pelo ID
        const query = 'SELECT * FROM products WHERE id = $1';
        const values = [id];

        const result = await pool.query(query, values);

        // Verificando se o produto foi encontrado
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Produto não encontrado" });
        }

        // Retornando o produto encontrado
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao listar produto por ID:", err);
        res.status(500).json({ error: "Erro interno ao listar produto", details: err.message });
    }
};


// ➔ Função para adicionar um novo produto
const adicionarProduto = async (req, res) => {
    try {
        const {
            nome,
            descricao,
            preco,
            estoque,
            marca,
            categoria,
            imagem_url,
            imagens,
            descricao_completa,
            old_price,
            rating,
            status
        } = req.body;

        const query = `
            INSERT INTO products
            (nome, descricao, preco, estoque, marca, categoria, imagem_url, imagens, descricao_completa, old_price, rating, status)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;

        const values = [
            nome,
            descricao,
            preco,
            estoque,
            marca,
            categoria,
            imagem_url,
            imagens ? `{${imagens.join(',')}}` : null,
            descricao_completa,
            old_price,
            rating,
            status
        ];

        const result = await pool.query(query, values);
        res.status(201).json({ message: "Produto adicionado com sucesso", produto: result.rows[0] });

    } catch (err) {
        console.error("Erro ao adicionar produto:", err);
        res.status(500).json({ error: "Erro ao adicionar produto", details: err.message });
    }
};



// ➔ Função para eliminar um produto
const eliminarProduto = async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
        const values = [id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Produto não encontrado para eliminar" });
        }

        res.json({ message: "Produto eliminado com sucesso", produto: result.rows[0] });
    } catch (err) {
        console.error("Erro ao eliminar produto:", err);
        res.status(500).json({ error: "Erro interno ao eliminar produto", details: err.message });
    }
};


module.exports = {
    listarProdutos,
    listarProdutoPorId,
    verificarEstoque,
    adicionarProduto,
    eliminarProduto
};
