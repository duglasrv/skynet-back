// Ruta: /src/controllers/dashboardController.js

const db = require('../config/db');

// Controlador para obtener datos del dashboard según el rol del usuario
exports.getDashboardData = async (req, res) => {
    // Extraer ID y rol del usuario autenticado desde el token
    const { id: userId, role } = req.user;

    try {
        // DASHBOARD PARA ADMINISTRADOR
        if (role === 'ADMIN') {
            // Consultas paralelas para optimizar el rendimiento
            const userCountPromise = db.query('SELECT COUNT(*) FROM users WHERE is_active = true');
            const clientCountPromise = db.query('SELECT COUNT(*) FROM clients');
            const pendingVisitsPromise = db.query("SELECT COUNT(*) FROM visits WHERE status = 'PENDING'");
            
            // GRÁFICO 1: Visitas por Supervisor - Cuenta visitas completadas por cada supervisor
            const visitsBySupervisorPromise = db.query(`
                SELECT u.name, COUNT(v.id) as completed_count FROM visits v
                JOIN users u ON v.supervisor_id = u.id
                WHERE v.status = 'FINISHED'
                GROUP BY u.name
                ORDER BY completed_count DESC
            `);
            
            // GRÁFICO 2: Estado global de visitas - Distribución de visitas por estado
            const globalStatusPromise = db.query("SELECT status, COUNT(*) as count FROM visits GROUP BY status");

            // Ejecutar todas las consultas en paralelo
            const [userCountRes, clientCountRes, pendingVisitsRes, visitsBySupervisorRes, globalStatusRes] = await Promise.all([
                userCountPromise, clientCountPromise, pendingVisitsPromise, visitsBySupervisorPromise, globalStatusPromise
            ]);

            // Retornar datos consolidados para el dashboard de ADMIN
            return res.json({
                userCount: parseInt(userCountRes.rows[0].count),
                clientCount: parseInt(clientCountRes.rows[0].count),
                pendingVisitsGlobal: parseInt(pendingVisitsRes.rows[0].count),
                charts: {
                    visitsBySupervisor: visitsBySupervisorRes.rows,  // Gráfico de rendimiento por supervisor
                    globalStatus: globalStatusRes.rows,              // Gráfico de estados globales
                }
            });
        }

        // DASHBOARD PARA SUPERVISOR
        if (role === 'SUPERVISOR') {
            // Estadísticas de visitas del equipo para el día actual
            const teamVisitsTodayQuery = `
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
                    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress,
                    COUNT(*) FILTER (WHERE status = 'FINISHED') AS finished
                FROM visits
                WHERE supervisor_id = $1 AND planned_at::date = CURRENT_DATE
            `;
            
            // Total de visitas pendientes del equipo
            const teamTotalPendingQuery = `SELECT COUNT(*) FROM visits WHERE supervisor_id = $1 AND status = 'PENDING'`;
            
            // Lista de técnicos del equipo con su estado actual
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

            // Ejecutar todas las consultas en paralelo
            const [teamVisitsTodayRes, teamTotalPendingRes, teamTechniciansRes, teamPerformanceRes, teamStatusRes] = await Promise.all([
                db.query(teamVisitsTodayQuery, [userId]), 
                db.query(teamTotalPendingQuery, [userId]), 
                db.query(teamTechniciansQuery, [userId]), 
                teamPerformancePromise, 
                teamStatusPromise
            ]);
            
            // Procesar estadísticas de visitas del día
            const teamVisitsToday = {
                total: parseInt(teamVisitsTodayRes.rows[0].total),
                pending: parseInt(teamVisitsTodayRes.rows[0].pending),
                in_progress: parseInt(teamVisitsTodayRes.rows[0].in_progress),
                finished: parseInt(teamVisitsTodayRes.rows[0].finished)
            };

            // Retornar datos consolidados para el dashboard de SUPERVISOR
            return res.json({
                teamVisitsToday,                    // Estadísticas del día
                totalPendingVisits: parseInt(teamTotalPendingRes.rows[0].count),  // Total pendiente
                teamTechnicians: teamTechniciansRes.rows,  // Lista de técnicos
                charts: {
                    teamPerformance: teamPerformanceRes.rows,  // Gráfico de rendimiento
                    teamStatus: teamStatusRes.rows             // Gráfico de estados
                }
            });
        }

        // DASHBOARD PARA TÉCNICO
        if (role === 'TECHNICIAN') {
            // Estadísticas de mis visitas del día
            const myVisitsQuery = `
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE status = 'FINISHED') AS completed,
                    COUNT(*) FILTER (WHERE status = 'PENDING' OR status = 'IN_PROGRESS') AS remaining
                FROM visits
                WHERE technician_id = $1 AND planned_at::date = CURRENT_DATE
            `;
            
            // Próxima visita programada
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

            // Ejecutar todas las consultas en paralelo
            const [myVisitsRes, nextVisitRes, weeklyPerformanceRes, myStatusRes] = await Promise.all([
                db.query(myVisitsQuery, [userId]), 
                db.query(nextVisitQuery, [userId]), 
                weeklyPerformancePromise, 
                myStatusPromise
            ]);
            
            // Procesar estadísticas de mis visitas
            const myVisits = {
                total: parseInt(myVisitsRes.rows[0].total),
                completed: parseInt(myVisitsRes.rows[0].completed),
                remaining: parseInt(myVisitsRes.rows[0].remaining)
            };

            // Retornar datos consolidados para el dashboard de TÉCNICO
            return res.json({
                myVisits,                          // Mis estadísticas del día
                nextVisit: nextVisitRes.rows[0] || null,  // Próxima visita
                charts: {
                    weeklyPerformance: weeklyPerformanceRes.rows,  // Gráfico semanal
                    myStatus: myStatusRes.rows                     // Gráfico de mis estados
                }
            });
        }
        
        // Si el rol no es reconocido, retornar error de autorización
        return res.status(403).json({ message: 'Rol no autorizado para acceder al dashboard.' });

    } catch (error) {
        // Manejar errores internos del servidor
        console.error("Error al obtener datos del dashboard:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};