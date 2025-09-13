const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
        // Extrae el token del formato "Bearer TOKEN"
        token = req.headers.authorization.split(' ')[1];

        // Verifica la firma del token usando el secreto
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adjunta el payload decodificado (con id, name, role) al objeto request
        // para que las siguientes funciones puedan usarlo.
        req.user = decoded;
        next();
        } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'No autorizado, el token falló.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no se encontró token.' });
    }
};

module.exports = { protect };