// --- Dependencias ---
// Importa la configuración de la base de datos para interactuar con ella.
const db = require('../config/db');
// Importa la librería bcryptjs, utilizada para encriptar y verificar contraseñas de forma segura.
const bcrypt = require('bcryptjs');

// --- Controlador para Crear un Nuevo Usuario ---
// Esta función maneja la solicitud POST para registrar un nuevo usuario en el sistema.
exports.createUser = async (req, res) => {
    // Extrae los datos del nuevo usuario del cuerpo (body) de la solicitud HTTP.
    // supervisor_id es opcional y se establece en null si no se proporciona.
    const { name, email, password, role, supervisor_id = null } = req.body;
    try {
        // Genera un "salt", que es una cadena aleatoria que se añade a la contraseña antes de encriptarla.
        // Esto asegura que dos contraseñas idénticas tengan hashes diferentes. El '10' es el costo o rondas de hashing.
        const salt = await bcrypt.genSalt(10);
        // Encripta (hash) la contraseña proporcionada por el usuario junto con el salt.
        const password_hash = await bcrypt.hash(password, salt);

        // Ejecuta una consulta SQL para insertar el nuevo usuario en la base de datos.
        // Utiliza placeholders ($1, $2, etc.) para pasar los valores de forma segura y prevenir inyección SQL.
        // 'RETURNING' devuelve los datos del usuario recién creado.
        const { rows } = await db.query(
            'INSERT INTO users (name, email, password_hash, role, supervisor_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, is_active',
            [name, email, password_hash, role, supervisor_id]
        );
        // Si la creación es exitosa, envía una respuesta con el código de estado 201 (Created)
        // y los datos del nuevo usuario en formato JSON.
        res.status(201).json(rows[0]);
    } catch (error) {
        // Si ocurre un error (ej: email duplicado), envía una respuesta con el código 500 (Internal Server Error)
        // y un mensaje de error.
        res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    }
};

// --- Controlador para Obtener Todos los Usuarios ---
// Maneja la solicitud GET para devolver una lista de todos los usuarios registrados.
exports.getAllUsers = async (req, res) => {
    try {
        // Ejecuta una consulta SQL para seleccionar campos específicos de todos los usuarios.
        // Se excluye el 'password_hash' por seguridad. Los resultados se ordenan por nombre.
        const { rows } = await db.query('SELECT id, name, email, role, supervisor_id, is_active FROM users ORDER BY name');
        // Envía la lista de usuarios como respuesta en formato JSON.
        res.json(rows);
    } catch (error) {
        // En caso de error, envía una respuesta de error 500.
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

// --- Controlador para Obtener un Usuario por su ID ---
// Maneja la solicitud GET para devolver los datos de un único usuario, identificado por su ID.
exports.getUserById = async (req, res) => {
    try {
        // Ejecuta una consulta SQL para encontrar un usuario donde el 'id' coincida con el proporcionado en los parámetros de la URL.
        const { rows } = await db.query('SELECT id, name, email, role, supervisor_id, is_active FROM users WHERE id = $1', [req.params.id]);
        // Si la consulta no devuelve ninguna fila (el array 'rows' está vacío), significa que el usuario no existe.
        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        // Si se encuentra el usuario, envía sus datos como respuesta.
        res.json(rows[0]);
    } catch (error) {
        // En caso de error en la consulta, envía una respuesta de error 500.
        res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
    }
};

// --- Controlador para Actualizar un Usuario ---
// Maneja la solicitud PUT o PATCH para modificar los datos de un usuario existente.
exports.updateUser = async (req, res) => {
    // Extrae los datos a actualizar del cuerpo de la solicitud.
    const { name, email, role, supervisor_id, is_active } = req.body;
    try {
        // Ejecuta una consulta SQL UPDATE para cambiar los valores del usuario especificado por el ID en la URL.
        // 'updated_at = NOW()' actualiza automáticamente la marca de tiempo de la última modificación.
        // 'RETURNING' devuelve los datos del usuario ya actualizado.
        const { rows } = await db.query(
            'UPDATE users SET name = $1, email = $2, role = $3, supervisor_id = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING id, name, email, role, is_active',
            [name, email, role, supervisor_id, is_active, req.params.id]
        );
        // Si la consulta no actualiza ninguna fila, el usuario no fue encontrado.
        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        // Envía los datos actualizados del usuario como respuesta.
        res.json(rows[0]);
    } catch (error) {
        // En caso de error, envía una respuesta de error 500.
        res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
};

// --- Controlador para Eliminar un Usuario ---
// Maneja la solicitud DELETE para eliminar un usuario de la base de datos.
exports.deleteUser = async (req, res) => {
    try {
        // Ejecuta una consulta SQL DELETE para eliminar al usuario cuyo ID se pasa en la URL.
        // 'rowCount' nos dice cuántas filas fueron afectadas (eliminadas).
        const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        // Si rowCount es 0, ninguna fila fue eliminada, por lo que el usuario no existía.
        if (rowCount === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        // Si la eliminación es exitosa, envía una respuesta con el código 204 (No Content),
        // que es la práctica estándar para respuestas a DELETE exitosas, ya que no hay contenido que devolver.
        res.status(204).send();
    } catch (error) {
        // En caso de error (ej: una restricción de clave foránea impide el borrado), envía una respuesta 500.
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
};