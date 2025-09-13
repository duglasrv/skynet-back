const db = require('../config/db');

exports.createVisit = async (req, res) => {
    const { client_id, technician_id, planned_at } = req.body;
    const supervisor_id = req.user.id; // El supervisor es el usuario logueado
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

exports.getAllVisits = async (req, res) => {
    // Consulta base con JOINs para obtener nombres en lugar de solo IDs
    let query = `
        SELECT 
            v.id, v.planned_at, v.status,
            c.name as client_name,
            t.name as technician_name,
            s.name as supervisor_name
        FROM visits v
        JOIN clients c ON v.client_id = c.id
        JOIN users t ON v.technician_id = t.id
        JOIN users s ON v.supervisor_id = s.id
    `;
    const params = [];

    // Filtramos según el rol del usuario que hace la petición
    if (req.user.role === 'SUPERVISOR') {
        query += ' WHERE v.supervisor_id = $1';
        params.push(req.user.id);
    } else if (req.user.role === 'TECHNICIAN') {
        query += ' WHERE v.technician_id = $1';
        params.push(req.user.id);
    }
    // El ADMIN no tiene filtro, ve todo.
    
    query += ' ORDER BY v.planned_at DESC';

    try {
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener visitas', error: error.message });
    }
};

exports.getTechnicianTodayVisits = async (req, res) => {
    const technician_id = req.user.id;
    try {
        const { rows } = await db.query(
            `SELECT v.*, c.name as client_name, c.address, c.lat, c.lng, c.email as client_email
             FROM visits v 
             JOIN clients c ON v.client_id = c.id
             WHERE v.technician_id = $1 AND v.planned_at::date = CURRENT_DATE
             ORDER BY v.planned_at ASC`,
            [technician_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las visitas de hoy", error: error.message });
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

        // AQUÍ IRÍA LA LÓGICA PARA ENVIAR EL EMAIL Y GENERAR EL PDF
        
        res.json({ message: 'Check-out realizado con éxito', visit: rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error en el check-out', error: error.message });
    } finally {
        client.release();
    }
};