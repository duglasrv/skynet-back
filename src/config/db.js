// Ruta: /skynet-back/src/config/db.js (Versión Final y Robusta)

const { Pool } = require('pg');
require('dotenv').config();

// --- CONFIGURACIÓN DE BASE DE DATOS DINÁMICA Y ROBUSTA ---

const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    
    // --- Tiempos de espera para robustez de red ---
    // Cierra conexiones inactivas después de 30 segundos.
    idleTimeoutMillis: 30000,
    // Aborta el intento de conexión si tarda más de 5 segundos.
    connectionTimeoutMillis: 5000,
};

// Si estamos en producción (como en Railway), añadimos la configuración de SSL.
if (process.env.NODE_ENV === 'production') {
    dbConfig.ssl = {
        rejectUnauthorized: false
    };
}

// Creamos el pool con la configuración correcta para el entorno actual.
const pool = new Pool(dbConfig);

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
};