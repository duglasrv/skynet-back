const { Pool } = require('pg');
require('dotenv').config();

// --- CAMBIO CLAVE: CONFIGURACIÓN DINÁMICA DE LA BASE DE DATOS ---

// 1. Empezamos con la configuración base que funciona en local.
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
};

// 2. Si la aplicación está corriendo en producción (como en Railway),
//    añadimos la configuración de SSL requerida.
if (process.env.NODE_ENV === 'production') {
    dbConfig.ssl = {
        rejectUnauthorized: false
    };
}

// 3. Creamos el pool con la configuración correcta para el entorno actual.
const pool = new Pool(dbConfig);


module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
};