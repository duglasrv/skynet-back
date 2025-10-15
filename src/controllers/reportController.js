// Ruta: /src/controllers/reportController.js

// --- Dependencias ---
// Importa la configuración de la base de datos para poder realizar consultas.
const db = require('../config/db'); 
// Importa Puppeteer, una librería para controlar un navegador (Chrome) mediante código, usada aquí para generar PDFs.
const puppeteer = require('puppeteer'); 
// Importa el Parser de la librería json2csv, que convierte objetos JSON a formato CSV.
const { Parser } = require('json2csv'); 

// --- Consulta SQL Base ---
// Esta es la consulta SQL principal que se reutilizará en varias funciones.
// Selecciona campos de diferentes tablas para construir un reporte completo.
const baseReportQuery = `
    SELECT 
        vr.id as report_id,            -- ID del reporte de visita
        vr.summary,                    -- Resumen del trabajo realizado
        vr.minutes_spent,              -- Minutos que tomó la visita
        vr.created_at,                 -- Fecha de creación del reporte
        v.id as visit_id,              -- ID de la visita
        v.planned_at,                  -- Fecha planificada de la visita
        v.status,                      -- Estado actual de la visita (ej: PENDIENTE, COMPLETADA)
        c.name as client_name,         -- Nombre del cliente
        tech.name as technician_name,  -- Nombre del técnico asignado
        sup.name as supervisor_name    -- Nombre del supervisor a cargo
    FROM visit_reports vr
    JOIN visits v ON vr.visit_id = v.id        -- Une con la tabla de visitas
    JOIN clients c ON v.client_id = c.id       -- Une con la tabla de clientes
    JOIN users tech ON v.technician_id = tech.id -- Une con la tabla de usuarios para obtener el nombre del técnico
    JOIN users sup ON v.supervisor_id = sup.id   -- Une con la tabla de usuarios para obtener el nombre del supervisor
`;

// --- Función Auxiliar para Filtros ---
// Función reutilizable que construye la cláusula WHERE de la consulta SQL dinámicamente
// basándose en los filtros de la solicitud (req.query) y el rol del usuario (req.user).
const applyFilters = (req) => {
    // Extrae el rol y el ID del usuario que hace la petición.
    const { role, id: userId } = req.user;
    // Extrae los posibles filtros de la URL (query parameters).
    const { status, technicianId, supervisorId, startDate, endDate } = req.query;

    // 'conditions' almacenará las partes de la cláusula WHERE (ej: "v.status = $1").
    const conditions = [];
    // 'params' almacenará los valores que reemplazarán a los placeholders ($1, $2, etc.) para evitar inyección SQL.
    const params = [];
    // 'paramIndex' lleva la cuenta del número del placeholder.
    let paramIndex = 1;

    // Lógica de permisos: si el usuario es un SUPERVISOR, solo puede ver las visitas que él supervisa.
    if (role === 'SUPERVISOR') {
        conditions.push(`v.supervisor_id = $${paramIndex++}`);
        params.push(userId);
    }

    // Lógica de filtros aplicados por el usuario en la interfaz.
    // Si se proporciona un 'status', se añade el filtro a la consulta.
    if (status) {
        conditions.push(`v.status = $${paramIndex++}`);
        params.push(status);
    }
    // Si se proporciona un 'technicianId', se añade el filtro.
    if (technicianId) {
        conditions.push(`v.technician_id = $${paramIndex++}`);
        params.push(technicianId);
    }
    // Si un ADMIN filtra por supervisor, se añade el filtro. Se valida que solo el ADMIN pueda usarlo.
    if (supervisorId && role === 'ADMIN') {
        conditions.push(`v.supervisor_id = $${paramIndex++}`);
        params.push(supervisorId);
    }
    // Si se proporciona una 'startDate', filtra visitas desde esa fecha en adelante.
    if (startDate) {
        conditions.push(`v.planned_at::date >= $${paramIndex++}`);
        params.push(startDate);
    }
    // Si se proporciona una 'endDate', filtra visitas hasta esa fecha.
    if (endDate) {
        conditions.push(`v.planned_at::date <= $${paramIndex++}`);
        params.push(endDate);
    }
    
    // Construye la cláusula WHERE final.
    let whereClause = '';
    // Si hay al menos una condición, se une todo con 'AND'.
    if (conditions.length > 0) {
        whereClause = ' WHERE ' + conditions.join(' AND ');
    }

    // Retorna la cláusula WHERE construida y el array de parámetros.
    return { whereClause, params };
};


// --- Controlador para Obtener Reportes (JSON) ---
// Esta función maneja la solicitud GET para obtener una lista de reportes en formato JSON.
exports.getReports = async (req, res) => {
    try {
        // Llama a la función auxiliar para obtener la cláusula WHERE y los parámetros según los filtros aplicados.
        const { whereClause, params } = applyFilters(req);
        // Concatena la consulta base con los filtros y ordena los resultados por fecha de creación.
        const query = baseReportQuery + whereClause + ' ORDER BY vr.created_at DESC';
        // Ejecuta la consulta en la base de datos.
        const { rows } = await db.query(query, params);
        // Envía los resultados como respuesta en formato JSON.
        res.json(rows);
    } catch (error) {
        // Si ocurre un error, lo imprime en la consola del servidor.
        console.error("Error al obtener reportes:", error);
        // Envía una respuesta de error al cliente.
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- Controlador para Exportar Reportes a CSV ---
// Esta función maneja la solicitud para exportar los reportes filtrados a un archivo CSV.
exports.exportReportsAsCsv = async (req, res) => {
    try {
        // Obtiene los filtros de la misma manera que la función getReports.
        const { whereClause, params } = applyFilters(req);
        // Construye y ejecuta la consulta para obtener los datos a exportar.
        const query = baseReportQuery + whereClause + ' ORDER BY vr.created_at DESC';
        const { rows } = await db.query(query, params);

        // Si la consulta no devuelve resultados, informa al usuario.
        if (rows.length === 0) {
            return res.status(404).json({ message: "No hay reportes que coincidan con los filtros para exportar." });
        }

        // Define las columnas (y su orden) que aparecerán en el archivo CSV.
        const fields = ['report_id', 'visit_id', 'client_name', 'technician_name', 'supervisor_name', 'status', 'planned_at', 'minutes_spent', 'summary'];
        const opts = { fields };
        // Crea una nueva instancia del conversor JSON a CSV.
        const parser = new Parser(opts);
        // Convierte los datos obtenidos de la BD (JSON) a formato CSV.
        const csv = parser.parse(rows);

        // Establece las cabeceras de la respuesta HTTP para indicar que es un archivo CSV.
        res.header('Content-Type', 'text/csv');
        // Sugiere al navegador un nombre de archivo para la descarga.
        res.attachment('reporte-skynet.csv');
        // Envía el contenido del archivo CSV como respuesta.
        res.send(csv);

    } catch (error) {
        console.error("Error al exportar a CSV:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// --- Controlador para Generar un Reporte Individual en PDF ---
// Esta función genera un archivo PDF para un reporte de visita específico.
exports.generateReportPdf = async (req, res) => {
    // Obtiene el ID de la visita desde los parámetros de la URL (ej: /reports/pdf/123).
    const { visitId } = req.params;

    try {
        // 1. Obtener los datos completos de la visita para el reporte.
        // Se define una consulta específica para obtener todos los detalles necesarios para el PDF.
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
        // Ejecuta la consulta pasando el visitId como parámetro.
        const { rows } = await db.query(query, [visitId]);
        // Si no se encuentra ningún reporte para esa visita, devuelve un error 404.
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Reporte no encontrado.' });
        }
        // Almacena los datos del reporte en una variable.
        const reportData = rows[0];

        // 2. Crear el contenido HTML para el PDF.
        // Se define una plantilla HTML como un string, inyectando los datos del reporte.
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Visita Técnica</title>
                <style>
                    /* Estilos CSS para dar formato al PDF */
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
        
        // 3. Usar Puppeteer para generar el PDF.
        // Inicia una instancia de un navegador sin interfaz gráfica. '--no-sandbox' es una opción a menudo necesaria en entornos de servidor.
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        // Abre una nueva página/pestaña en el navegador.
        const page = await browser.newPage();
        // Carga el contenido HTML en la página. 'waitUntil' asegura que todo se cargue antes de continuar.
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        // Genera el PDF a partir de la página cargada. Se especifica el formato y que se imprima el fondo.
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        // Cierra el navegador para liberar recursos.
        await browser.close();

        // 4. Enviar el PDF al cliente.
        // Configura las cabeceras de la respuesta para que el navegador sepa que está recibiendo un PDF.
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename="reporte-visita-${visitId}.pdf"` // Sugiere un nombre de archivo para la descarga.
        });
        // Envía el buffer del PDF (los datos del archivo) como respuesta.
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error al generar PDF:", error);
        res.status(500).json({ message: 'Error al generar el reporte PDF.' });
    }
};