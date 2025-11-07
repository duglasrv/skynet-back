// Ruta: /skynet-back/src/config/db.js (con SSL habilitado)

const { Pool } = require('pg');
require('dotenv').config();

// Se crea un pool de conexiones para gestionar las conexiones a la DB de forma eficiente.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    
    // --- CAMBIO CLAVE: HABILITAR SSL PARA CONEXIONES EN PRODUCCIÓN (RAILWAY) ---
    // Esta configuración es crucial para que tu aplicación (una vez iniciada)
    // pueda conectarse a la base de datos de Railway de forma segura.
    ssl: {
      rejectUnauthorized: false
    }
});

module.exports = {
    // Función para ejecutar consultas, usando el pool.
    // Recibe el texto de la consulta SQL y los parámetros para evitar inyecciones
    query: (text, params) => pool.query(text, params),
    
    // Función para usar transacciones
    // Obtiene un cliente dedicado del pool para ejecutar múltiples operaciones en una transacción
    getClient: () => pool.connect(),
};