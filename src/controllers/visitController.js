// Ruta: /backend/src/controllers/visitController.js

const db = require('../config/db');

// ENDPOINT REFACTORIZADO Y POTENCIADO
exports.getAllVisits = async (req, res) => {
    const { role, id: userId } = req.user;
    // Extraemos los filtros de la query string (ej: /api/visits?status=PENDING&technicianId=3)
    const { status, technicianId, supervisorId, startDate, endDate } = req.query;

    let query = `
        SELECT 
            v.id, v.planned_at, v.status,
            c.name as client_name, c.address, c.lat, c.lng, c.email as client_email,
            t.name as technician_name,
            s.name as supervisor_name
        FROM visits v
        JOIN clients c ON v.client_id = c.id
        JOIN users t ON v.technician_id = t.id
        JOIN users s ON v.supervisor_id = s.id
    `;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // --- LÓGICA DE PERMISOS ---
    if (role === 'SUPERVISOR') {
        conditions.push(`v.supervisor_id = $${paramIndex++}`);
        params.push(userId);
    } else if (role === 'TECHNICIAN') {
        conditions.push(`v.technician_id = $${paramIndex++}`);
        params.push(userId);
    }
    // El ADMIN no tiene restricciones de permiso iniciales

    // --- LÓGICA DE FILTROS ---
    if (status) {
        conditions.push(`v.status = $${paramIndex++}`);
        params.push(status);
    }
    if (technicianId) {
        conditions.push(`v.technician_id = $${paramIndex++}`);
        params.push(technicianId);
    }
    if (supervisorId && role === 'ADMIN') { // Solo el admin puede filtrar por supervisor
        conditions.push(`v.supervisor_id = $${paramIndex++}`);
        params.push(supervisorId);
    }
    if (startDate) {
        conditions.push(`v.planned_at >= $${paramIndex++}`);
        params.push(startDate);
    }
    if (endDate) {
        conditions.push(`v.planned_at <= $${paramIndex++}`);
        params.push(endDate);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY v.planned_at DESC';

    try {
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener visitas', error: error.message });
    }
};

// --- EL RESTO DE FUNCIONES SE MANTIENEN IGUAL ---

exports.createVisit = async (req, res) => {
    // Obtenemos los datos del cuerpo de la petición
    const { client_id, technician_id, planned_at } = req.body;
    
    // Obtenemos los datos del usuario que hace la petición (del token)
    const { id: creatorId, role: creatorRole } = req.user;

    let supervisor_id;

    // Lógica inteligente de asignación
    if (creatorRole === 'SUPERVISOR') {
        // Si el creador es un supervisor, se auto-asigna
        supervisor_id = creatorId;
    } else if (creatorRole === 'ADMIN') {
        // Si es un admin, DEBE haber enviado un supervisor_id en la petición
        if (!req.body.supervisor_id) {
            return res.status(400).json({ message: 'Como Administrador, debes seleccionar un supervisor para la visita.' });
        }
        supervisor_id = req.body.supervisor_id;
    } else {
        return res.status(403).json({ message: 'No tienes permiso para crear visitas.' });
    }

    try {
        const { rows } = await db.query(
            'INSERT INTO visits (client_id, technician_id, supervisor_id, planned_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [client_id, technician_id, supervisor_id, planned_at]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la visita', error: error.message });
    }
};

exports.technicianCheckIn = async (req, res) => {
    const visit_id = req.params.id;
    const { lat, lng } = req.body;
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            "UPDATE visits SET status = 'IN_PROGRESS' WHERE id = $1 AND technician_id = $2 RETURNING *",
            [visit_id, req.user.id]
        );
        if(rows.length === 0) throw new Error("Visita no encontrada o no asignada a este técnico.");
        
        await client.query(
            "INSERT INTO visit_logs (visit_id, event_type, lat, lng) VALUES ($1, 'CHECKIN', $2, $3)",
            [visit_id, lat, lng]
        );
        await client.query('COMMIT');
        res.json({ message: 'Check-in realizado con éxito', visit: rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error en el check-in', error: error.message });
    } finally {
        client.release();
    }
};

exports.technicianCheckOut = async (req, res) => {
    const visit_id = req.params.id;
    const { lat, lng, summary, minutes_spent } = req.body;
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            "UPDATE visits SET status = 'FINISHED' WHERE id = $1 AND technician_id = $2 RETURNING *",
            [visit_id, req.user.id]
        );
        if(rows.length === 0) throw new Error("Visita no encontrada o no asignada a este técnico.");

        await client.query(
            "INSERT INTO visit_logs (visit_id, event_type, lat, lng) VALUES ($1, 'CHECKOUT', $2, $3)",
            [visit_id, lat, lng]
        );
        await client.query(
            "INSERT INTO visit_reports (visit_id, summary, minutes_spent) VALUES ($1, $2, $3)",
            [visit_id, summary, minutes_spent]
        );
        await client.query('COMMIT');
        
        res.json({ message: 'Check-out realizado con éxito', visit: rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error en el check-out', error: error.message });
    } finally {
        client.release();
    }
};