import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Se requiere un token de acceso.' });
  }

  const token = authHeader.slice(7).trim();
  const secret = process.env.JWT_SECRET || (
    process.env.NODE_ENV === 'production' ? null : 'alcaldia_leon_dev_only_secret'
  );

  if (!token) {
    return res.status(401).json({ error: 'El token de acceso está vacío.' });
  }
  if (!secret) {
    return res.status(503).json({ error: 'La autenticación no está configurada en el servidor.' });
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ error: 'El token de acceso no es válido o ha expirado.' });
  }
};
