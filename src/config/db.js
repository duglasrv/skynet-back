const { Pool } = require('pg');
require('dotenv').config();

// Se crea un pool de conexiones para gestionar las conexiones a la DB de forma eficiente.
// El pool permite reutilizar conexiones existentes en lugar de crear nuevas cada vez
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Para despliegue en servicios como Railway/Heroku, a veces se necesita SSL.
    // ssl: {
    //   rejectUnauthorized: false
    // }
});

module.exports = {
    // Función para ejecutar consultas, usando el pool.
    // Recibe el texto de la consulta SQL y los parámetros para evitar inyecciones
    query: (text, params) => pool.query(text, params),
    
    // Función para usar transacciones
    // Obtiene un cliente dedicado del pool para ejecutar múltiples operaciones en una transacción
    getClient: () => pool.connect(),
};