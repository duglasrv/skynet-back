// Ruta: /src/controllers/reportController.js

const db = require('../config/db');
const puppeteer = require('puppeteer');

// @desc    Obtener una lista de todos los reportes de visitas finalizadas
// @route   GET /api/reports
exports.getReports = async (req, res) => {
    const { role, id: userId } = req.user;
    
    // Esta consulta es compleja porque une múltiples tablas para obtener todos los nombres
    let query = `
        SELECT 
            vr.id as report_id,
            vr.summary,
            vr.minutes_spent,
            vr.created_at,
            v.id as visit_id,
            v.planned_at,
            c.name as client_name,
            tech.name as technician_name,
            sup.name as supervisor_name
        FROM visit_reports vr
        JOIN visits v ON vr.visit_id = v.id
        JOIN clients c ON v.client_id = c.id
        JOIN users tech ON v.technician_id = tech.id
        JOIN users sup ON v.supervisor_id = sup.id
    `;
    const params = [];

    // Filtramos por supervisor si el rol no es ADMIN
    if (role === 'SUPERVISOR') {
        query += ' WHERE v.supervisor_id = $1';
        params.push(userId);
    }

    query += ' ORDER BY vr.created_at DESC';

    try {
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener reportes:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// @desc    Generar y descargar un PDF para un reporte de visita específico
// @route   GET /api/reports/:visitId/pdf
exports.generateReportPdf = async (req, res) => {
    const { visitId } = req.params;

    try {
        // 1. Obtener los datos completos de la visita para el reporte
        const query = `
            SELECT 
                vr.summary, vr.minutes_spent, vr.created_at,
                v.planned_at,
                c.name as client_name, c.email as client_email, c.address as client_address,
                tech.name as technician_name,
                sup.name as supervisor_name
            FROM visit_reports vr
            JOIN visits v ON vr.visit_id = v.id
            JOIN clients c ON v.client_id = c.id
            JOIN users tech ON v.technician_id = tech.id
            JOIN users sup ON v.supervisor_id = sup.id
            WHERE v.id = $1
            LIMIT 1;
        `;
        const { rows } = await db.query(query, [visitId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Reporte no encontrado.' });
        }
        const reportData = rows[0];

        // 2. Crear el contenido HTML para el PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                    .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #1a237e; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                    .details-box { background: #f9f9f9; padding: 15px; border-radius: 5px; }
                    h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; color: #1a237e; }
                    p { line-height: 1.6; }
                    strong { color: #555; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Reporte de Visita Técnica</h1>
                    <p>SkyNet S.A.</p>
                </div>
                <div class="details-grid">
                    <div class="details-box">
                        <h2>Detalles del Cliente</h2>
                        <p><strong>Cliente:</strong> ${reportData.client_name}</p>
                        <p><strong>Dirección:</strong> ${reportData.client_address}</p>
                        <p><strong>Email:</strong> ${reportData.client_email}</p>
                    </div>
                    <div class="details-box">
                        <h2>Detalles de la Visita</h2>
                        <p><strong>Fecha de Finalización:</strong> ${new Date(reportData.created_at).toLocaleDateString('es-GT')}</p>
                        <p><strong>Técnico Asignado:</strong> ${reportData.technician_name}</p>
                        <p><strong>Duración:</strong> ${reportData.minutes_spent} minutos</p>
                    </div>
                </div>
                <div>
                    <h2>Resumen del Trabajo Realizado</h2>
                    <p>${reportData.summary}</p>
                </div>
            </body>
            </html>
        `;
        
        // 3. Usar Puppeteer para generar el PDF
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] }); // --no-sandbox es importante para entornos de despliegue
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        // 4. Enviar el PDF al cliente
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            // Esto le dice al navegador que lo descargue con un nombre de archivo específico
            'Content-Disposition': `attachment; filename="reporte-visita-${visitId}.pdf"`
        });
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error al generar PDF:", error);
        res.status(500).json({ message: 'Error al generar el reporte PDF.' });
    }
};