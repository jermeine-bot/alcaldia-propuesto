export const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Acceso no autorizado. Token no verificado.' });
    }

    const userRole = req.user.role || 'visor';

    // El superadmin siempre tiene acceso completo
    if (userRole === 'superadmin') {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      error: `Acceso denegado. Se requiere rol [${allowedRoles.join(', ')}], pero tu rol actual es [${userRole}].`
    });
  };
};
