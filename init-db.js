// Ruta: /skynet-back/init-db.js (Versión Final y Robusta)

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// --- CONFIGURACIÓN DE BASE DE DATOS DINÁMICA Y ROBUSTA ---

const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
};

// Si estamos en producción, añadimos la configuración de SSL.
if (process.env.NODE_ENV === 'production') {
    dbConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(dbConfig);

const runSqlFile = async (filePath) => {
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`Executing script: ${path.basename(filePath)}...`);
        await pool.query(sql);
        console.log(`✅ Script ${path.basename(filePath)} executed successfully.`);
    } catch (error) {
        console.error(`❌ Error executing ${path.basename(filePath)}:`, error);
        process.exit(1); 
    }
};

const initializeDatabase = async () => {
    console.log('Starting database initialization...');
    await runSqlFile(path.join(__dirname, 'src', 'db', 'schema.sql'));
    await runSqlFile(path.join(__dirname, 'src', 'db', 'data.sql'));
    console.log('🎉 Database initialization completed.');
    await pool.end();
};

initializeDatabase();