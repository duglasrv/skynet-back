const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, ingrese email y contraseña.' });
    }

    try {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
        const user = rows[0];

        // Si no se encuentra el usuario o la contraseña no coincide, se da el mismo mensaje
        // para no revelar si un email está registrado o no.
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

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '8h',
        });

        res.json({
        message: 'Login exitoso.',
        token,
        user: payload
        });

    } catch (error) {
        console.error('Error en el login:', error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = { login };