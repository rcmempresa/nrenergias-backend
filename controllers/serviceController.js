const pool = require('../config/db'); // Importando a conexão com o banco

// Listar serviços (com busca opcional)
const listarServicos = async (req, res) => {
    try {
        const { search } = req.query;

        let query = 'SELECT * FROM services';
        let values = [];

        if (search) {
            query += ' WHERE LOWER(nome) LIKE LOWER($1)';
            values.push(`%${search}%`);
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao listar serviços:", err);
        res.status(500).json({ error: "Erro interno ao listar serviços", details: err.message });
    }
};

// Buscar serviço por ID
const listarServicosPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM services WHERE id = $1';
        const values = [id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Serviço não encontrado" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao listar serviço por ID:", err);
        res.status(500).json({ error: "Erro interno ao listar serviço", details: err.message });
    }
};

// Adicionar um novo serviço
const adicionarServico = async (req, res) => {
    try {
        const { nome, descricao, preco_unidade, tipo } = req.body;

        const query = `
            INSERT INTO services (nome, descricao, preco_unidade, tipo)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [nome, descricao, preco_unidade, tipo];

        const result = await pool.query(query, values);
        res.status(201).json({ message: "Serviço adicionado com sucesso", servico: result.rows[0] });

    } catch (err) {
        console.error("Erro ao adicionar serviço:", err);
        res.status(500).json({ error: "Erro ao adicionar serviço", details: err.message });
    }
};

// Eliminar um serviço
const eliminarServico = async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM services WHERE id = $1 RETURNING *';
        const values = [id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Serviço não encontrado para eliminar" });
        }

        res.json({ message: "Serviço eliminado com sucesso", servico: result.rows[0] });
    } catch (err) {
        console.error("Erro ao eliminar serviço:", err);
        res.status(500).json({ error: "Erro interno ao eliminar serviço", details: err.message });
    }
};

module.exports = {
    listarServicos,
    listarServicosPorId,
    adicionarServico,
    eliminarServico
};
