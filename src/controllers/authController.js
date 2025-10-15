const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controlador para el proceso de login de usuarios
const login = async (req, res) => {
    // Extraer email y contraseña del cuerpo de la solicitud
    const { email, password } = req.body;

    // Validar que se hayan proporcionado ambos campos
    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, ingrese email y contraseña.' });
    }

    try {
        // Buscar usuario en la base de datos por email y que esté activo
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
        const user = rows[0];

        // Si no se encuentra el usuario o la contraseña no coincide, se da el mismo mensaje
        // para no revelar si un email está registrado o no (seguridad).
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // El payload es la información que se guardará dentro del token.
        // NUNCA guardes información sensible como la contraseña aquí.
        const payload = {
        id: user.id,
        name: user.name,
        role: user.role,
        };

        // Generar token JWT con el payload y la clave secreta
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '8h', // El token expira en 8 horas
        });

        // Responder con éxito, el token y la información del usuario
        res.json({
        message: 'Login exitoso.',
        token,
        user: payload
        });

    } catch (error) {
        // Manejar errores internos del servidor
        console.error('Error en el login:', error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = { login };