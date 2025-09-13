// /backend/createAdmin.js

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Datos del administrador que quieres crear
const adminEmail = 'admin@skynet.com';
const adminPassword = 'admin123'; // La contraseña en texto plano
const adminName = 'Admin User';
const adminRole = 'ADMIN';

// Creamos una nueva instancia del Pool de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createAdminUser = async () => {
    console.log('Iniciando la creación del usuario administrador...');

    try {
        // 1. Hashear la contraseña
        console.log('Generando hash para la contraseña...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);
        console.log('Hash generado con éxito.');

        // 2. Insertar el nuevo usuario en la base de datos
        console.log('Insertando usuario en la base de datos...');
        const query = `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING; -- Esto previene errores si el email ya existe
        `;
        const values = [adminName, adminEmail, passwordHash, adminRole];

        await pool.query(query, values);

        console.log('✅ ¡Usuario administrador creado o ya existente con éxito!');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);

    } catch (error) {
        console.error('❌ Error al crear el usuario administrador:', error);
    } finally {
        // 3. Cerrar la conexión a la base de datos
        await pool.end();
        console.log('Conexión con la base de datos cerrada.');
    }
};

// Ejecutamos la función
createAdminUser();