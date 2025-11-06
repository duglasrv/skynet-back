// Ruta: /skynet-back/init-db.js

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Configura el pool de la misma manera que en tu db.js
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Podrías necesitar SSL en producción con Railway
    // ssl: {
    //   rejectUnauthorized: false
    // }
});

const runSqlFile = async (filePath) => {
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`Ejecutando script: ${path.basename(filePath)}...`);
        await pool.query(sql);
        console.log(`✅ Script ${path.basename(filePath)} ejecutado con éxito.`);
    } catch (error) {
        console.error(`❌ Error ejecutando ${path.basename(filePath)}:`, error);
        // Sal del proceso con un código de error para detener el despliegue
        process.exit(1); 
    }
};

const initializeDatabase = async () => {
    console.log('Iniciando la inicialización de la base de datos...');
    
    // Ejecuta primero el schema para crear las tablas
    await runSqlFile(path.join(__dirname, 'db', 'schema.sql'));
    
    // Luego, ejecuta el script de datos para poblarlas
    await runSqlFile(path.join(__dirname, 'db', 'data.sql'));
    
    console.log('🎉 Inicialización de la base de datos completada.');
    
    // Cierra el pool de conexiones ya que este script solo se usa para inicializar
    await pool.end();
};

// Llama a la función principal
initializeDatabase();