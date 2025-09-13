// Este es un middleware de "alto orden", una función que devuelve otra función.
// Permite pasarle los roles permitidos como un array.
const checkRole = (roles) => (req, res, next) => {
    // Si no hay usuario adjunto en la request (del middleware 'protect') o
    // si el rol del usuario no está en la lista de roles permitidos...
    if (!req.user || !roles.includes(req.user.role)) {
        // Devuelve un error 403 Forbidden (Prohibido).
        return res.status(403).json({ message: 'Acceso denegado. No tienes los permisos necesarios.' });
    }
    // Si el usuario tiene el rol correcto, pasa al siguiente middleware o controlador.
    next();
};

module.exports = { checkRole };