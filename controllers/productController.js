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
            status,
            caracteristicas
        } = req.body;

        const query = `
            INSERT INTO products
            (nome, descricao, preco, estoque, marca, categoria, imagem_url, imagens, descricao_completa, old_price, rating, status, caracteristicas)
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
            imagens && Array.isArray(imagens) ? `{${imagens.join(',')}}` : null,
            descricao_completa,
            old_price,
            rating,
            status,
            typeof caracteristicas === 'object' && caracteristicas !== null
                ? JSON.stringify(caracteristicas)
                : caracteristicas 
        ];

        const result = await pool.query(query, values);
        res.status(201).json({ message: "Produto adicionado com sucesso", produto: result.rows[0] });

    } catch (err) {
        console.error("Erro ao adicionar produto:", err);
        res.status(500).json({ error: "Erro ao adicionar produto", details: err.message });
    }
};

const atualizarProduto = async (req, res) => {
    try {
        const { id } = req.params; // ID do produto a ser atualizado
        const { // Dados do corpo da requisição que podem ser atualizados
            nome,
            descricao,
            preco,
            estoque,
            marca,
            categoria,
            imagem_url,
            imagens, // Este é um array de URLs
            descricao_completa,
            old_price,
            rating,
            status,
            avaliacoes, // Adicionado avaliacoes aqui
            caracteristicas, // Este pode ser um objeto ou string JSON
        } = req.body;

        const fields = []; // Array para armazenar os campos a serem atualizados
        const values = []; // Array para armazenar os valores dos campos
        let paramIndex = 1; // Índice para os parâmetros da query ($1, $2, etc.)

        // Mapeia os campos do body para a query UPDATE
        if (nome !== undefined) {
            fields.push(`nome = $${paramIndex++}`);
            values.push(nome);
        }
        if (descricao !== undefined) {
            fields.push(`descricao = $${paramIndex++}`);
            values.push(descricao);
        }
        if (preco !== undefined) {
            fields.push(`preco = $${paramIndex++}`);
            values.push(preco);
        }
        if (estoque !== undefined) {
            fields.push(`estoque = $${paramIndex++}`);
            values.push(estoque);
        }
        if (marca !== undefined) {
            fields.push(`marca = $${paramIndex++}`);
            values.push(marca);
        }
        if (categoria !== undefined) {
            fields.push(`categoria = $${paramIndex++}`);
            values.push(categoria);
        }
        if (imagem_url !== undefined) {
            fields.push(`imagem_url = $${paramIndex++}`);
            values.push(imagem_url);
        }
        
        // --- CORREÇÃO 1: Tratamento de arrays para 'imagens' ---
        if (imagens !== undefined) {
            fields.push(`imagens = $${paramIndex++}`);
            // PostgreSQL espera arrays como '{item1,item2}' ou para strings com espaços/vírgulas '{"item 1","item,2"}'
            // A forma mais segura é passar o array diretamente para o driver 'pg', ele o converterá.
            // Se 'imagens' não for um array (e.g., null), trate-o como null para a DB
            values.push(Array.isArray(imagens) ? imagens : null);
        }

        if (descricao_completa !== undefined) {
            fields.push(`descricao_completa = $${paramIndex++}`);
            values.push(descricao_completa);
        }
        if (old_price !== undefined) {
            fields.push(`old_price = $${paramIndex++}`);
            values.push(old_price);
        }
        if (rating !== undefined) {
            fields.push(`rating = $${paramIndex++}`);
            values.push(rating);
        }
        if (status !== undefined) {
            fields.push(`status = $${paramIndex++}`);
            values.push(status);
        }
        // --- CORREÇÃO 2: Adicionado 'avaliacoes' aqui ---
        if (avaliacoes !== undefined) {
            fields.push(`avaliacoes = $${paramIndex++}`);
            values.push(avaliacoes);
        }
        // --- CORREÇÃO 3: Tratamento de JSON para 'caracteristicas' ---
        if (caracteristicas !== undefined) {
            fields.push(`caracteristicas = $${paramIndex++}`);
            // Se o frontend envia como objeto, JSON.stringify. Se já é string (mas é JSON), use como está.
            // PostgreSQL JSONB exige uma string JSON válida.
            try {
                // Tenta fazer parse se for string, para ter certeza que é um objeto antes de stringify
                const parsedCaracteristicas = typeof caracteristicas === 'string'
                    ? JSON.parse(caracteristicas)
                    : caracteristicas;
                values.push(JSON.stringify(parsedCaracteristicas));
            } catch (e) {
                // Se for uma string não-JSON válida, ou outro erro, trate como texto ou erro.
                // Dependendo da sua necessidade, pode querer lançar um erro ou usar null.
                // Para JSONB, deve ser JSON válido.
                console.warn("Caracteristicas não é um JSON válido ou objeto:", caracteristicas, e);
                values.push(null); // Ou lançar um erro se for obrigatório ser JSON
            }
        }

        // Se nenhum campo foi fornecido para atualização
        if (fields.length === 0) {
            return res.status(400).json({ error: "Nenhum campo fornecido para atualização." });
        }

        // Adiciona o ID do produto ao final dos valores para a cláusula WHERE
        values.push(id);

        const query = `
            UPDATE products
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *;
        `;

        // --- Adicione logs temporários para depuração, se ainda precisar ---
        console.log("---------------------------------------");
        console.log("QUERY DE UPDATE GERADA:");
        console.log(query);
        console.log("VALORES DA QUERY:");
        console.log(values);
        console.log("---------------------------------------");

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Produto não encontrado para atualização" });
        }

        res.json({ message: "Produto atualizado com sucesso", produto: result.rows[0] });

    } catch (err) {
        console.error("Erro ao atualizar produto:", err);
        // Retorna o detalhe do erro apenas em desenvolvimento para não expor info sensível
        res.status(500).json({ error: "Erro interno do servidor ao atualizar produto", details: err.message });
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
    atualizarProduto,
    eliminarProduto
};
