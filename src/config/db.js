const { Pool } = require('pg');
require('dotenv').config();

// Se crea un pool de conexiones para gestionar las conexiones a la DB de forma eficiente.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Para despliegue en servicios como Railway/Heroku, a veces se necesita SSL.
    // ssl: {
    //   rejectUnauthorized: false
    // }
});

module.exports = {
    // Función para ejecutar consultas, usando el pool.
    query: (text, params) => pool.query(text, params),
    // Función para usar transacciones
    getClient: () => pool.connect(),
};