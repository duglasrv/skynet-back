// Ruta: /backend/src/controllers/visitController.js

// --- Dependencias ---
// Importa la configuración de la base de datos para poder realizar consultas.
const db = require('../config/db');

// --- Controlador para Obtener Todas las Visitas (con filtros y permisos) ---
// Maneja la solicitud GET para obtener una lista de visitas.
// Esta función es robusta: aplica filtros según los parámetros de la URL y
// restringe los datos que un usuario puede ver según su rol.
exports.getAllVisits = async (req, res) => {
    // Extrae el rol y el ID del usuario que está haciendo la petición (viene del token de autenticación).
    const { role, id: userId } = req.user;
    // Extrae los posibles filtros de los query parameters de la URL (ej: /visits?status=PENDING).
    const { status, technicianId, supervisorId, startDate, endDate } = req.query;

    // Define la consulta SQL base que une las tablas de visitas, clientes y usuarios.
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
    
    // 'conditions' almacenará las condiciones SQL para la cláusula WHERE.
    const conditions = [];
    // 'params' almacenará los valores para esas condiciones, evitando inyección SQL.
    const params = [];
    // 'paramIndex' lleva la cuenta del número del placeholder ($1, $2, etc.).
    let paramIndex = 1;

    // --- LÓGICA DE PERMISOS ---
    // Si el usuario es un SUPERVISOR, solo puede ver las visitas que él supervisa.
    if (role === 'SUPERVISOR') {
        conditions.push(`v.supervisor_id = $${paramIndex++}`);
        params.push(userId);
    // Si el usuario es un TÉCNICO, solo puede ver las visitas que tiene asignadas.
    } else if (role === 'TECHNICIAN') {
        conditions.push(`v.technician_id = $${paramIndex++}`);
        params.push(userId);
    }
    // Si es ADMIN, no se aplica ningún filtro de permisos y puede ver todo.

    // --- LÓGICA DE FILTROS ---
    // Si se proporciona un filtro de 'status', se añade a la consulta.
    if (status) {
        conditions.push(`v.status = $${paramIndex++}`);
        params.push(status);
    }
    // Si se proporciona un filtro de 'technicianId', se añade.
    if (technicianId) {
        conditions.push(`v.technician_id = $${paramIndex++}`);
        params.push(technicianId);
    }
    // Si se filtra por 'supervisorId' y el usuario es ADMIN, se añade el filtro.
    if (supervisorId && role === 'ADMIN') {
        conditions.push(`v.supervisor_id = $${paramIndex++}`);
        params.push(supervisorId);
    }
    // Si se proporciona una fecha de inicio, se filtran visitas a partir de esa fecha.
    if (startDate) {
        conditions.push(`v.planned_at >= $${paramIndex++}`);
        params.push(startDate);
    }
    // Si se proporciona una fecha de fin, se filtran visitas hasta esa fecha.
    if (endDate) {
        conditions.push(`v.planned_at <= $${paramIndex++}`);
        params.push(endDate);
    }

    // Si hay al menos una condición (de permiso o de filtro), se construye la cláusula WHERE.
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Se añade la ordenación para que las visitas más recientes aparezcan primero.
    query += ' ORDER BY v.planned_at DESC';

    try {
        // Ejecuta la consulta final con los parámetros correspondientes.
        const { rows } = await db.query(query, params);
        // Devuelve los resultados en formato JSON.
        res.json(rows);
    } catch (error) {
        // Si hay un error en la base de datos, se envía una respuesta de error.
        res.status(500).json({ message: 'Error al obtener visitas', error: error.message });
    }
};

// --- EL RESTO DE FUNCIONES SE MANTIENEN IGUAL ---

// --- Controlador para Crear una Nueva Visita ---
exports.createVisit = async (req, res) => {
    // Extrae los datos necesarios del cuerpo de la solicitud.
    const { client_id, technician_id, planned_at } = req.body;
    // Extrae el ID y el rol del usuario que está creando la visita.
    const { id: creatorId, role: creatorRole } = req.user;
    let supervisor_id;

    // Lógica para asignar el supervisor_id automáticamente según quién crea la visita.
    if (creatorRole === 'SUPERVISOR') {
        // Si el creador es un supervisor, él mismo es el supervisor de la visita.
        supervisor_id = creatorId;
    } else if (creatorRole === 'ADMIN') {
        // Si es un admin, debe especificar quién es el supervisor en el cuerpo de la solicitud.
        if (!req.body.supervisor_id) {
            return res.status(400).json({ message: 'Como Administrador, debes seleccionar un supervisor.' });
        }
        supervisor_id = req.body.supervisor_id;
    } else {
        // Si no es ni SUPERVISOR ni ADMIN (ej: un técnico), no tiene permiso para crear visitas.
        return res.status(403).json({ message: 'No tienes permiso.' });
    }

    try {
        // Inserta la nueva visita en la base de datos.
        const { rows } = await db.query(
            'INSERT INTO visits (client_id, technician_id, supervisor_id, planned_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [client_id, technician_id, supervisor_id, planned_at]
        );
        // Devuelve el registro de la visita recién creada con un estado 201 (Created).
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la visita', error: error.message });
    }
};

// --- Controlador para que un Técnico haga Check-In ---
// Marca una visita como 'IN_PROGRESS' y registra la ubicación del técnico.
exports.technicianCheckIn = async (req, res) => {
    const visit_id = req.params.id; // ID de la visita desde la URL.
    const { lat, lng } = req.body; // Coordenadas de geolocalización desde el cuerpo de la solicitud.

    // Obtiene un cliente de la pool de conexiones. Esto es crucial para usar transacciones.
    const client = await db.getClient();
    try {
        // Inicia una transacción. Todos los comandos siguientes se ejecutan como un solo bloque.
        await client.query('BEGIN');

        // Actualiza el estado de la visita a 'IN_PROGRESS'.
        // Solo puede hacerlo el técnico al que se le asignó la visita.
        const { rows } = await client.query(
            "UPDATE visits SET status = 'IN_PROGRESS' WHERE id = $1 AND technician_id = $2 RETURNING *",
            [visit_id, req.user.id]
        );
        // Si la consulta no devuelve filas, la visita no existe o no pertenece al técnico.
        if(rows.length === 0) throw new Error("Visita no encontrada o no asignada a este técnico.");

        // Inserta un registro en el log de visitas para el evento de CHECKIN.
        await client.query(
            "INSERT INTO visit_logs (visit_id, event_type, lat, lng) VALUES ($1, 'CHECKIN', $2, $3)",
            [visit_id, lat, lng]
        );
        
        // Si todo fue exitoso, confirma la transacción para guardar los cambios en la BD.
        await client.query('COMMIT');
        res.json({ message: 'Check-in realizado con éxito', visit: rows[0] });
    } catch (error) {
        // Si algo falla, revierte la transacción. Ningún cambio se guardará.
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error en el check-in', error: error.message });
    } finally {
        // Es muy importante liberar el cliente de la base de datos para que otros puedan usarlo.
        // Esto se ejecuta siempre, tanto si hubo éxito como si hubo error.
        client.release();
    }
};

// --- Controlador para que un Técnico haga Check-Out ---
// Marca una visita como 'FINISHED', registra la ubicación y crea el reporte de la visita.
exports.technicianCheckOut = async (req, res) => {
    const visit_id = req.params.id; // ID de la visita desde la URL.
    const { lat, lng, summary, minutes_spent } = req.body; // Datos del reporte desde el body.
    
    // Inicia una transacción para asegurar la atomicidad de las operaciones.
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Actualiza el estado de la visita a 'FINISHED'.
        const { rows } = await client.query(
            "UPDATE visits SET status = 'FINISHED' WHERE id = $1 AND technician_id = $2 RETURNING *",
            [visit_id, req.user.id]
        );
        if(rows.length === 0) throw new Error("Visita no encontrada o no asignada a este técnico.");

        // Inserta el registro del evento de CHECKOUT en el log.
        await client.query(
            "INSERT INTO visit_logs (visit_id, event_type, lat, lng) VALUES ($1, 'CHECKOUT', $2, $3)",
            [visit_id, lat, lng]
        );
        
        // Crea el reporte de la visita con el resumen y los minutos empleados.
        await client.query(
            "INSERT INTO visit_reports (visit_id, summary, minutes_spent) VALUES ($1, $2, $3)",
            [visit_id, summary, minutes_spent]
        );
        
        // Confirma la transacción.
        await client.query('COMMIT');
        res.json({ message: 'Check-out realizado con éxito', visit: rows[0] });
    } catch (error) {
        // Revierte la transacción en caso de error.
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error en el check-out', error: error.message });
    } finally {
        // Libera la conexión a la base de datos.
        client.release();
    }
};