// Importa la librería 'jsonwebtoken', que es fundamental para crear, firmar y verificar JSON Web Tokens (JWT).
const jwt = require('jsonwebtoken');

/**
 * Middleware de protección de rutas.
 * Su propósito es verificar que una solicitud entrante tenga un token JWT válido.
 * Si el token es válido, permite que la solicitud continúe hacia el controlador de la ruta.
 * Si no es válido o no existe, bloquea la solicitud y devuelve un error de "No autorizado".
 */
const protect = (req, res, next) => {
    // Declara una variable para almacenar el token.
    let token;

    // Comprueba si la solicitud tiene la cabecera 'authorization' Y si empieza con "Bearer ".
    // Este es el formato estándar para enviar tokens JWT.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extraer el token.
            // El formato es "Bearer <token>", así que se divide la cadena por el espacio
            // y se toma el segundo elemento (índice 1), que es el token en sí.
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar el token.
            // jwt.verify() decodifica el token y comprueba si la firma es válida usando la clave secreta.
            // La clave secreta (process.env.JWT_SECRET) debe ser la misma que se usó para firmar el token al iniciar sesión.
            // Si el token es inválido (expirado, manipulado), lanzará un error que será capturado por el 'catch'.
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Adjuntar datos del usuario a la solicitud.
            // Si la verificación es exitosa, 'decoded' contiene el "payload" del token (ej: id, nombre, rol del usuario).
            // Se adjunta este objeto a la solicitud (req.user) para que los siguientes controladores
            // (las funciones que se ejecutan después de este middleware) tengan acceso a la información del usuario autenticado.
            req.user = decoded;
            
            // 4. Continuar al siguiente middleware o controlador.
            // next() pasa el control a la siguiente función en la cadena de la ruta.
            next();
        } catch (error) {
            // Si jwt.verify() falla, se entra en este bloque.
            console.error(error); // Muestra el error en la consola del servidor para depuración.
            // Devuelve un error 401 (No autorizado) al cliente, indicando que el token no es válido.
            return res.status(401).json({ message: 'No autorizado, el token falló.' });
        }
    }

    // Si después del primer 'if' la variable 'token' sigue sin definirse,
    // significa que no se encontró la cabecera 'Authorization' o no tenía el formato correcto.
    if (!token) {
        // Devuelve un error 401 (No autorizado) al cliente.
        return res.status(401).json({ message: 'No autorizado, no se encontró token.' });
    }
};

// Exporta la función 'protect' para que pueda ser importada y utilizada en los archivos de rutas
// para proteger los endpoints que requieran autenticación.
module.exports = { protect };