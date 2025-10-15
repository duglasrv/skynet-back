/**
 * Middleware de Autorización Basado en Roles.
 *
 * Este archivo exporta una "función de orden superior" (una función que crea y devuelve otra función).
 * Su propósito es crear un middleware específico que restringe el acceso a una ruta solo a los usuarios
 * que tengan uno de los roles especificados.
 *
 * Se usa así en las rutas: `router.post('/', protect, checkRole(['ADMIN', 'SUPERVISOR']), miControlador);`
 * Primero se ejecuta `protect` para autenticar, y luego `checkRole` para autorizar.
 */

// 'checkRole' es la función de orden superior.
// No es un middleware en sí misma, sino una fábrica que produce middlewares.
//
// @param {string[]} roles - Un array de strings que contiene los roles permitidos para acceder a la ruta.
//                           Ejemplo: ['ADMIN', 'SUPERVISOR']
// @returns {function} - Devuelve una función middleware estándar de Express (req, res, next).
const checkRole = (roles) => (req, res, next) => {
    // La función devuelta es el middleware que Express ejecutará.
    // Esta función tiene acceso al array 'roles' gracias a un concepto de JavaScript llamado "closure".

    // Se realiza la comprobación de autorización.
    // La condición fallará si:
    // 1. `!req.user`: El objeto 'user' no existe en la solicitud. Esto significa que el middleware 'protect'
    //    probablemente no se ejecutó antes, por lo que no sabemos quién es el usuario.
    // 2. `!roles.includes(req.user.role)`: El rol del usuario autenticado (ej: 'TECHNICIAN') NO está
    //    incluido en la lista de roles permitidos que se pasó a `checkRole` (ej: ['ADMIN']).
    if (!req.user || !roles.includes(req.user.role)) {
        // Si la condición es verdadera, el usuario no tiene los permisos necesarios.
        // Se envía una respuesta con el código de estado 403 Forbidden.
        // 403 es diferente de 401:
        // - 401 (Unauthorized) significa "No estás autenticado".
        // - 403 (Forbidden) significa "Sé quién eres, pero no tienes permiso para acceder a este recurso".
        return res.status(403).json({ message: 'Acceso denegado. No tienes los permisos necesarios.' });
    }

    // Si el código llega hasta aquí, significa que el usuario está autenticado (`req.user` existe)
    // y su rol está en la lista de roles permitidos.
    // `next()` pasa el control al siguiente middleware en la cadena o al controlador final de la ruta.
    next();
};

// Exporta la función `checkRole` para que pueda ser utilizada en la definición de las rutas de la aplicación.
module.exports = { checkRole };