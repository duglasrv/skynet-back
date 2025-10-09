// Ruta: /src/controllers/dashboardController.js

const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
    const { id: userId, role } = req.user;

    try {
        if (role === 'ADMIN') {
            const userCountPromise = db.query('SELECT COUNT(*) FROM users WHERE is_active = true');
            const clientCountPromise = db.query('SELECT COUNT(*) FROM clients');
            const pendingVisitsPromise = db.query("SELECT COUNT(*) FROM visits WHERE status = 'PENDING'");
            
            // GRÁFICO 1: Visitas por Supervisor
            const visitsBySupervisorPromise = db.query(`
                SELECT u.name, COUNT(v.id) as completed_count FROM visits v
                JOIN users u ON v.supervisor_id = u.id
                WHERE v.status = 'FINISHED'
                GROUP BY u.name
                ORDER BY completed_count DESC
            `);
            
            // GRÁFICO 2: Estado global de visitas
            const globalStatusPromise = db.query("SELECT status, COUNT(*) as count FROM visits GROUP BY status");

            const [userCountRes, clientCountRes, pendingVisitsRes, visitsBySupervisorRes, globalStatusRes] = await Promise.all([
                userCountPromise, clientCountPromise, pendingVisitsPromise, visitsBySupervisorPromise, globalStatusPromise
            ]);

            return res.json({
                userCount: parseInt(userCountRes.rows[0].count),
                clientCount: parseInt(clientCountRes.rows[0].count),
                pendingVisitsGlobal: parseInt(pendingVisitsRes.rows[0].count),
                charts: {
                    visitsBySupervisor: visitsBySupervisorRes.rows,
                    globalStatus: globalStatusRes.rows,
                }
            });
        }

        if (role === 'SUPERVISOR') {
            const teamVisitsTodayQuery = `
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
                    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress,
                    COUNT(*) FILTER (WHERE status = 'FINISHED') AS finished
                FROM visits
                WHERE supervisor_id = $1 AND planned_at::date = CURRENT_DATE
            `;
            const teamTotalPendingQuery = `SELECT COUNT(*) FROM visits WHERE supervisor_id = $1 AND status = 'PENDING'`;
            const teamTechniciansQuery = `
                SELECT 
                    u.id, u.name, 
                    COALESCE(v.status, 'PENDING') AS status,
                    c.name as "currentVisitClient"
                FROM users u
                LEFT JOIN visits v ON u.id = v.technician_id AND v.status = 'IN_PROGRESS' AND v.planned_at::date = CURRENT_DATE
                LEFT JOIN clients c ON v.client_id = c.id
                WHERE u.supervisor_id = $1 AND u.role = 'TECHNICIAN' AND u.is_active = true
            `;
            
            // GRÁFICO 1: Rendimiento del equipo (visitas completadas en los últimos 30 días)
            const teamPerformancePromise = db.query(`
                SELECT u.name, COUNT(v.id) as completed_count FROM visits v
                JOIN users u ON v.technician_id = u.id
                WHERE v.supervisor_id = $1 AND v.status = 'FINISHED' AND v.planned_at >= NOW() - INTERVAL '30 days'
                GROUP BY u.name
                ORDER BY completed_count DESC
            `, [userId]);
            
            // GRÁFICO 2: Estado de todas las visitas del equipo
            const teamStatusPromise = db.query("SELECT status, COUNT(*) as count FROM visits WHERE supervisor_id = $1 GROUP BY status", [userId]);

            const [teamVisitsTodayRes, teamTotalPendingRes, teamTechniciansRes, teamPerformanceRes, teamStatusRes] = await Promise.all([
                db.query(teamVisitsTodayQuery, [userId]), 
                db.query(teamTotalPendingQuery, [userId]), 
                db.query(teamTechniciansQuery, [userId]), 
                teamPerformancePromise, 
                teamStatusPromise
            ]);
            
            const teamVisitsToday = {
                total: parseInt(teamVisitsTodayRes.rows[0].total),
                pending: parseInt(teamVisitsTodayRes.rows[0].pending),
                in_progress: parseInt(teamVisitsTodayRes.rows[0].in_progress),
                finished: parseInt(teamVisitsTodayRes.rows[0].finished)
            };

            return res.json({
                teamVisitsToday,
                totalPendingVisits: parseInt(teamTotalPendingRes.rows[0].count),
                teamTechnicians: teamTechniciansRes.rows,
                charts: {
                    teamPerformance: teamPerformanceRes.rows,
                    teamStatus: teamStatusRes.rows
                }
            });
        }

        if (role === 'TECHNICIAN') {
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
                    c.name as client_name, c.address, v.planned_at
                FROM visits v
                JOIN clients c ON v.client_id = c.id
                WHERE v.technician_id = $1 AND v.status = 'PENDING'
                ORDER BY v.planned_at ASC
                LIMIT 1
            `;
            
            // GRÁFICO 1: Rendimiento semanal (visitas completadas en los últimos 7 días)
            const weeklyPerformancePromise = db.query(`
                SELECT TO_CHAR(days.day, 'YYYY-MM-DD') as date, COUNT(v.id) as count
                FROM (SELECT generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day')::date as day) as days
                LEFT JOIN visits v ON v.planned_at::date = days.day AND v.technician_id = $1 AND v.status = 'FINISHED'
                GROUP BY days.day ORDER BY days.day
            `, [userId]);
            
            // GRÁFICO 2: Desglose de todas mis visitas por estado
            const myStatusPromise = db.query("SELECT status, COUNT(*) as count FROM visits WHERE technician_id = $1 GROUP BY status", [userId]);

            const [myVisitsRes, nextVisitRes, weeklyPerformanceRes, myStatusRes] = await Promise.all([
                db.query(myVisitsQuery, [userId]), 
                db.query(nextVisitQuery, [userId]), 
                weeklyPerformancePromise, 
                myStatusPromise
            ]);
            
            const myVisits = {
                total: parseInt(myVisitsRes.rows[0].total),
                completed: parseInt(myVisitsRes.rows[0].completed),
                remaining: parseInt(myVisitsRes.rows[0].remaining)
            };

            return res.json({
                myVisits,
                nextVisit: nextVisitRes.rows[0] || null,
                charts: {
                    weeklyPerformance: weeklyPerformanceRes.rows,
                    myStatus: myStatusRes.rows
                }
            });
        }
        
        return res.status(403).json({ message: 'Rol no autorizado para acceder al dashboard.' });

    } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};