const db = require('../config/db');

exports.createClient = async (req, res) => {
    const { name, address, contact_name, phone, lat, lng } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO clients (name, address, contact_name, phone, lat, lng) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, address, contact_name, phone, lat, lng]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear cliente', error: error.message });
    }
};

exports.getAllClients = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM clients ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
    }
};

exports.getClientById = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cliente', error: error.message });
    }
};

exports.updateClient = async (req, res) => {
    const { name, address, contact_name, phone, lat, lng } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE clients SET name=$1, address=$2, contact_name=$3, phone=$4, lat=$5, lng=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
            [name, address, contact_name, phone, lat, lng, req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar cliente', error: error.message });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const { rowCount } = await db.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar cliente', error: error.message });
    }
};