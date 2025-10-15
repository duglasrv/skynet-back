// Ruta: /src/controllers/clientController.js

const db = require('../config/db');

// Controlador para crear un nuevo cliente
exports.createClient = async (req, res) => {
    // 1. Añadimos 'email' al desestructurado - Extraer datos del cuerpo de la solicitud
    const { name, address, contact_name, phone, lat, lng, email } = req.body;
    try {
        // 2. Añadimos 'email' a la consulta INSERT - Crear nuevo cliente en la base de datos
        const { rows } = await db.query(
            'INSERT INTO clients (name, address, contact_name, phone, lat, lng, email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, address, contact_name, phone, lat, lng, email]
        );
        // Responder con el cliente creado y código 201 (Created)
        res.status(201).json(rows[0]);
    } catch (error) {
        // Manejar errores del servidor
        res.status(500).json({ message: 'Error al crear cliente', error: error.message });
    }
};

// Controlador para obtener todos los clientes
exports.getAllClients = async (req, res) => {
    try {
        // Consultar todos los clientes ordenados por nombre
        const { rows } = await db.query('SELECT * FROM clients ORDER BY name');
        // Responder con la lista de clientes
        res.json(rows);
    } catch (error) {
        // Manejar errores del servidor
        res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
    }
};

// Controlador para obtener un cliente por su ID
exports.getClientById = async (req, res) => {
    try {
        // Buscar cliente por ID en los parámetros de la ruta
        const { rows } = await db.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
        // Si no se encuentra el cliente, retornar error 404
        if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        // Responder con el cliente encontrado
        res.json(rows[0]);
    } catch (error) {
        // Manejar errores del servidor
        res.status(500).json({ message: 'Error al obtener cliente', error: error.message });
    }
};

// Controlador para actualizar un cliente existente
exports.updateClient = async (req, res) => {
    // 3. Añadimos 'email' al desestructurado - Extraer datos del cuerpo de la solicitud
    const { name, address, contact_name, phone, lat, lng, email } = req.body;
    try {
        // 4. Añadimos 'email' a la consulta UPDATE - Actualizar cliente en la base de datos
        const { rows } = await db.query(
            'UPDATE clients SET name=$1, address=$2, contact_name=$3, phone=$4, lat=$5, lng=$6, email=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
            [name, address, contact_name, phone, lat, lng, email, req.params.id]
        );
        // Si no se encuentra el cliente, retornar error 404
        if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        // Responder con el cliente actualizado
        res.json(rows[0]);
    } catch (error) {
        // Manejar errores del servidor
        res.status(500).json({ message: 'Error al actualizar cliente', error: error.message });
    }
};

// Controlador para eliminar un cliente
exports.deleteClient = async (req, res) => {
    try {
        // Eliminar cliente por ID
        const { rowCount } = await db.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
        // Si no se encuentra el cliente, retornar error 404
        if (rowCount === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        // Responder sin contenido (éxito pero sin datos)
        res.status(204).send();
    } catch (error) {
        // Manejar errores del servidor
        res.status(500).json({ message: 'Error al eliminar cliente', error: error.message });
    }
};