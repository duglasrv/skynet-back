// Ruta: /skynet-back/init-db.js (con SSL habilitado)

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Configura el pool de la misma manera que en tu db.js
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    
    // --- CAMBIO CLAVE: HABILITAR SSL PARA CONEXIONES EN PRODUCCIÓN (RAILWAY) ---
    // En entornos de producción como Railway, la conexión a la base de datos
    // casi siempre requiere una conexión segura (SSL).
    ssl: {
      rejectUnauthorized: false
    }
});

const runSqlFile = async (filePath) => {
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`Ejecuting script: ${path.basename(filePath)}...`);
        await pool.query(sql);
        console.log(`✅ Script ${path.basename(filePath)} executed successfully.`);
    } catch (error) {
        console.error(`❌ Error executing ${path.basename(filePath)}:`, error);
        // Sal del proceso con un código de error para detener el despliegue
        process.exit(1); 
    }
};

const initializeDatabase = async () => {
    console.log('Starting database initialization...');
    
    // Ejecuta primero el schema para crear las tablas
    await runSqlFile(path.join(__dirname, 'src', 'db', 'schema.sql'));
    
    // Luego, ejecuta el script de datos para poblarlas
    await runSqlFile(path.join(__dirname, 'src', 'db', 'data.sql'));
    
    console.log('🎉 Database initialization completed.');
    
    // Cierra el pool de conexiones ya que este script solo se usa para inicializar
    await pool.end();
};

// Llama a la función principal
initializeDatabase();