// /backend/createAdmin.js

// --- Dependencias y Configuración ---

// Carga las variables de entorno del archivo .env para acceder a datos sensibles como la URL de la base de datos.
require('dotenv').config();
// Importa el constructor 'Pool' de la librería 'pg' para gestionar las conexiones con la base de datos PostgreSQL.
const { Pool } = require('pg');
// Importa la librería 'bcryptjs' para encriptar (hashear) contraseñas de forma segura.
const bcrypt = require('bcryptjs');

// --- Datos del Usuario Administrador ---
// Define aquí los datos del usuario administrador que deseas crear o asegurar que exista.
const adminEmail = 'admin@skynet.com';
const adminPassword = 'admin123'; // La contraseña en texto plano que será encriptada.
const adminName = 'Admin User';
const adminRole = 'ADMIN';

// --- Conexión a la Base de Datos ---
// Crea una nueva instancia del Pool de conexiones de PostgreSQL.
// Utiliza la variable de entorno 'DATABASE_URL' para la configuración de la conexión.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Función asíncrona principal para crear el usuario administrador.
 * Se conecta a la base de datos, hashea la contraseña e inserta el usuario.
 * Está diseñada para ser segura y poder ejecutarse múltiples veces sin causar errores.
 */
const createAdminUser = async () => {
    console.log('Iniciando la creación del usuario administrador...');

    // Se utiliza un bloque try...catch...finally para manejar posibles errores
    // y asegurar que la conexión a la base de datos siempre se cierre al final.
    try {
        // --- 1. Hashear la Contraseña ---
        // Es una práctica de seguridad fundamental. Nunca se deben guardar contraseñas en texto plano.
        console.log('Generando hash para la contraseña...');
        // Genera un 'salt' (una cadena aleatoria) para añadir a la contraseña antes del hashing.
        const salt = await bcrypt.genSalt(10);
        // Hashea la contraseña junto con el salt.
        const passwordHash = await bcrypt.hash(adminPassword, salt);
        console.log('Hash generado con éxito.');

        // --- 2. Insertar el Usuario en la Base de Datos ---
        console.log('Insertando usuario en la base de datos...');
        // Define la consulta SQL para insertar el nuevo usuario.
        const query = `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        -- Cláusula crucial: ON CONFLICT (email) DO NOTHING;
        -- Esto hace que el script sea "idempotente". Si se intenta insertar un usuario
        -- con un email que ya existe (lo cual violaría una restricción de unicidad),
        -- la consulta simplemente no hará nada en lugar de lanzar un error.
        -- Esto permite ejecutar el script de forma segura en cualquier momento.
        ON CONFLICT (email) DO NOTHING;
        `;
        // Define los valores que reemplazarán a los placeholders ($1, $2, etc.) en la consulta.
        const values = [adminName, adminEmail, passwordHash, adminRole];

        // Ejecuta la consulta en la base de datos.
        await pool.query(query, values);

        console.log('✅ ¡Usuario administrador creado o ya existente con éxito!');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);

    } catch (error) {
        // Si ocurre cualquier error durante el proceso (ej: no se puede conectar a la BD), se captura aquí.
        console.error('❌ Error al crear el usuario administrador:', error);
    } finally {
        // --- 3. Cerrar la Conexión ---
        // Este bloque se ejecuta siempre, tanto si el 'try' tuvo éxito como si el 'catch' capturó un error.
        // Es fundamental para liberar la conexión a la base de datos y evitar que el script se quede "colgado".
        await pool.end();
        console.log('Conexión con la base de datos cerrada.');
    }
};

// --- Ejecución del Script ---
// Se llama a la función principal para que se ejecute todo el proceso.
// Para correr este archivo, usarías el comando: node createAdmin.js
createAdminUser();