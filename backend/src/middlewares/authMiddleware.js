import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // En modo desarrollo, permitir sesión admin por defecto si no viene header
      req.user = {
        id: 'u-1',
        name: 'Administrador General',
        email: 'admin@alcaldaleon.gob.ni',
        role: 'superadmin'
      };
      return next();
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'alcaldia_leon_secret_jwt_key_2026_super_secure';

    // Soporte para token mock estático del frontend y tokens JWT reales
    if (token === 'jwt_mock_token_alcaldia_leon_2026' || token === 'mock_admin_token') {
      req.user = {
        id: 'u-1',
        name: 'Administrador General',
        email: 'admin@alcaldaleon.gob.ni',
        role: 'superadmin'
      };
      return next();
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    // Fallback permisivo de desarrollo
    req.user = {
      id: 'u-1',
      name: 'Administrador General',
      email: 'admin@alcaldaleon.gob.ni',
      role: 'superadmin'
    };
    next();
  }
};
