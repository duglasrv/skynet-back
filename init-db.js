const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// --- CAMBIO CLAVE: CONFIGURACIÓN DINÁMICA DE LA BASE DE DATOS ---

const dbConfig = {
    connectionString: process.env.DATABASE_URL,
};

if (process.env.NODE_ENV === 'production') {
    dbConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(dbConfig);


const runSqlFile = async (filePath) => {
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`Ejecuting script: ${path.basename(filePath)}...`);
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