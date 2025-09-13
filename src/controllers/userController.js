const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
    const { name, email, password, role, supervisor_id = null } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const { rows } = await db.query(
            'INSERT INTO users (name, email, password_hash, role, supervisor_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, is_active',
            [name, email, password_hash, role, supervisor_id]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, name, email, role, supervisor_id, is_active FROM users ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, name, email, role, supervisor_id, is_active FROM users WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { name, email, role, supervisor_id, is_active } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE users SET name = $1, email = $2, role = $3, supervisor_id = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING id, name, email, role, is_active',
            [name, email, role, supervisor_id, is_active, req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(204).send(); // 204 No Content
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
};