// Ruta: /src/controllers/reportController.js

const db = require('../config/db');
const puppeteer = require('puppeteer');
const { Parser } = require('json2csv');

// Esta es la consulta base que usaremos en todas las funciones de este controlador
const baseReportQuery = `
    SELECT 
        vr.id as report_id,
        vr.summary,
        vr.minutes_spent,
        vr.created_at,
        v.id as visit_id,
        v.planned_at,
        v.status,
        c.name as client_name,
        tech.name as technician_name,
        sup.name as supervisor_name
    FROM visit_reports vr
    JOIN visits v ON vr.visit_id = v.id
    JOIN clients c ON v.client_id = c.id
    JOIN users tech ON v.technician_id = tech.id
    JOIN users sup ON v.supervisor_id = sup.id
`;

// Función reutilizable para construir la cláusula WHERE y los parámetros de la consulta
const applyFilters = (req) => {
    const { role, id: userId } = req.user;
    const { status, technicianId, supervisorId, startDate, endDate } = req.query;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Lógica de permisos: el supervisor solo ve lo suyo
    if (role === 'SUPERVISOR') {
        conditions.push(`v.supervisor_id = $${paramIndex++}`);
        params.push(userId);
    }

    // Lógica de filtros aplicados por el usuario
    if (status) {
        conditions.push(`v.status = $${paramIndex++}`);
        params.push(status);
    }
    if (technicianId) {
        conditions.push(`v.technician_id = $${paramIndex++}`);
        params.push(technicianId);
    }
    // Solo el Admin puede usar el filtro de supervisor
    if (supervisorId && role === 'ADMIN') {
        conditions.push(`v.supervisor_id = $${paramIndex++}`);
        params.push(supervisorId);
    }
    if (startDate) {
        conditions.push(`v.planned_at::date >= $${paramIndex++}`);
        params.push(startDate);
    }
    if (endDate) {
        conditions.push(`v.planned_at::date <= $${paramIndex++}`);
        params.push(endDate);
    }
    
    let whereClause = '';
    if (conditions.length > 0) {
        whereClause = ' WHERE ' + conditions.join(' AND ');
    }

    return { whereClause, params };
};


// Controlador para obtener la lista de reportes (JSON)
exports.getReports = async (req, res) => {
    try {
        const { whereClause, params } = applyFilters(req);
        const query = baseReportQuery + whereClause + ' ORDER BY vr.created_at DESC';
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener reportes:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Controlador para exportar los reportes filtrados a CSV
exports.exportReportsAsCsv = async (req, res) => {
    try {
        const { whereClause, params } = applyFilters(req);
        const query = baseReportQuery + whereClause + ' ORDER BY vr.created_at DESC';
        const { rows } = await db.query(query, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No hay reportes que coincidan con los filtros para exportar." });
        }

        const fields = ['report_id', 'visit_id', 'client_name', 'technician_name', 'supervisor_name', 'status', 'planned_at', 'minutes_spent', 'summary'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(rows);

        res.header('Content-Type', 'text/csv');
        res.attachment('reporte-skynet.csv');
        res.send(csv);

    } catch (error) {
        console.error("Error al exportar a CSV:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// Controlador para generar un PDF de un reporte individual
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
                <title>Reporte de Visita Técnica</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 40px; color: #333; }
                    .header { text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #0d6efd; font-size: 28px; }
                    .header p { margin: 5px 0 0; color: #6c757d; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 30px; }
                    .details-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; }
                    h2 { border-bottom: 1px solid #dee2e6; padding-bottom: 10px; margin-top: 0; font-size: 18px; color: #0d6efd; }
                    p { line-height: 1.6; margin: 0 0 10px; }
                    p:last-child { margin-bottom: 0; }
                    strong { color: #212529; }
                    .summary-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; }
                    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #6c757d; }
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
                        <p><strong>Dirección:</strong> ${reportData.client_address || 'No especificada'}</p>
                        <p><strong>Email:</strong> ${reportData.client_email || 'No especificado'}</p>
                    </div>
                    <div class="details-box">
                        <h2>Detalles de la Visita</h2>
                        <p><strong>Fecha de Finalización:</strong> ${new Date(reportData.created_at).toLocaleString('es-GT')}</p>
                        <p><strong>Técnico Asignado:</strong> ${reportData.technician_name}</p>
                        <p><strong>Duración:</strong> ${reportData.minutes_spent} minutos</p>
                    </div>
                </div>
                <div class="summary-box">
                    <h2>Resumen del Trabajo Realizado</h2>
                    <p>${reportData.summary}</p>
                </div>
                <div class="footer">
                    <p>Gracias por su preferencia.</p>
                </div>
            </body>
            </html>
        `;
        
        // 3. Usar Puppeteer para generar el PDF
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        // 4. Enviar el PDF al cliente
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename="reporte-visita-${visitId}.pdf"`
        });
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error al generar PDF:", error);
        res.status(500).json({ message: 'Error al generar el reporte PDF.' });
    }
};