const pool = require('../config/db');

const listarCategorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY nome ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao listar categorias', details: err.message });
    }
};

const adicionarCategoria = async (req, res) => {
    try {
        const { nome } = req.body;
        if (!nome || !nome.trim()) {
            return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
        }
        const result = await pool.query(
            'INSERT INTO categories (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING RETURNING *',
            [nome.trim()]
        );
        if (result.rows.length === 0) {
            return res.status(409).json({ error: 'Esta categoria já existe.' });
        }
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao adicionar categoria', details: err.message });
    }
};

const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categoria não encontrada.' });
        }
        res.json({ message: 'Categoria eliminada com sucesso.', categoria: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao eliminar categoria', details: err.message });
    }
};

module.exports = { listarCategorias, adicionarCategoria, eliminarCategoria };
