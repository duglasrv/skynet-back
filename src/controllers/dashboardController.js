// Ruta: /src/controllers/dashboardController.js

const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
    // El middleware 'protect' ya nos dio los datos del usuario en req.user
    const { id: userId, role } = req.user;

    try {
        if (role === 'ADMIN') {
            // Para el Admin, obtenemos contadores globales
            const userCountPromise = db.query('SELECT COUNT(*) FROM users');
            const clientCountPromise = db.query('SELECT COUNT(*) FROM clients');
            const visitsTodayPromise = db.query("SELECT COUNT(*) FROM visits WHERE planned_at::date = CURRENT_DATE");

            // Ejecutamos todas las consultas en paralelo para mayor eficiencia
            const [userCountRes, clientCountRes, visitsTodayRes] = await Promise.all([
                userCountPromise,
                clientCountPromise,
                visitsTodayPromise
            ]);

            return res.json({
                userCount: parseInt(userCountRes.rows[0].count),
                clientCount: parseInt(clientCountRes.rows[0].count),
                totalVisitsToday: parseInt(visitsTodayRes.rows[0].count)
            });
        }

        if (role === 'SUPERVISOR') {
            // Para el Supervisor, obtenemos datos de su equipo
            const teamVisitsQuery = `
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
                    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress,
                    COUNT(*) FILTER (WHERE status = 'FINISHED') AS finished
                FROM visits
                WHERE supervisor_id = $1 AND planned_at::date = CURRENT_DATE
            `;

            const teamTechniciansQuery = `
                SELECT 
                    u.id, 
                    u.name, 
                    COALESCE(v.status, 'PENDING') AS status,
                    c.name as "currentVisitClient"
                FROM users u
                LEFT JOIN visits v ON u.id = v.technician_id AND v.status = 'IN_PROGRESS'
                LEFT JOIN clients c ON v.client_id = c.id
                WHERE u.supervisor_id = $1 AND u.role = 'TECHNICIAN'
            `;

            const [teamVisitsRes, teamTechniciansRes] = await Promise.all([
                db.query(teamVisitsQuery, [userId]),
                db.query(teamTechniciansQuery, [userId])
            ]);
            
            // Convertimos los counts a números
            const teamVisits = {
                total: parseInt(teamVisitsRes.rows[0].total),
                pending: parseInt(teamVisitsRes.rows[0].pending),
                in_progress: parseInt(teamVisitsRes.rows[0].in_progress),
                finished: parseInt(teamVisitsRes.rows[0].finished)
            };

            return res.json({
                teamVisits,
                teamTechnicians: teamTechniciansRes.rows
            });
        }

        if (role === 'TECHNICIAN') {
            // Para el Técnico, obtenemos sus datos personales del día
            const myVisitsQuery = `
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE status = 'FINISHED') AS completed,
                    COUNT(*) FILTER (WHERE status = 'PENDING' OR status = 'IN_PROGRESS') AS remaining
                FROM visits
                WHERE technician_id = $1 AND planned_at::date = CURRENT_DATE
            `;

            const nextVisitQuery = `
                SELECT 
                    c.name as client_name,
                    c.address,
                    v.planned_at
                FROM visits v
                JOIN clients c ON v.client_id = c.id
                WHERE v.technician_id = $1 AND v.status = 'PENDING'
                ORDER BY v.planned_at ASC
                LIMIT 1
            `;

            const [myVisitsRes, nextVisitRes] = await Promise.all([
                db.query(myVisitsQuery, [userId]),
                db.query(nextVisitQuery, [userId])
            ]);
            
            const myVisits = {
                total: parseInt(myVisitsRes.rows[0].total),
                completed: parseInt(myVisitsRes.rows[0].completed),
                remaining: parseInt(myVisitsRes.rows[0].remaining)
            };

            return res.json({
                myVisits,
                nextVisit: nextVisitRes.rows[0] || null // Devolvemos null si no hay próxima visita
            });
        }

        // Si el rol no es ninguno de los esperados
        return res.status(403).json({ message: 'Rol no autorizado para acceder al dashboard.' });

    } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};