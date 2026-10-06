import pool from '../config/db.js';
import { auditService } from '../services/auditService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production' ? null : 'alcaldia_leon_dev_only_secret'
);

export const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Debes proporcionar correo y contraseña.' });
      }

      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, user.password))) {
        await auditService.logAction({
          req,
          user: { email },
          action: 'LOGIN_FALLIDO',
          module: 'Autenticación',
          details: `Intento de acceso fallido para ${email}`
        });
        return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo o contraseña.' });
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      if (!JWT_SECRET) {
        return res.status(503).json({ error: 'La autenticación no está configurada en el servidor.' });
      }

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

      await auditService.logAction({
        req,
        user,
        action: 'LOGIN_EXITOSO',
        module: 'Autenticación',
        details: `Inicio de sesión exitoso como [${user.role}]`
      });

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        token
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error interno en inicio de sesión.' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: 'Proporciona tu contraseña actual y una nueva de al menos 8 caracteres.' });
      }
      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No se encontró el usuario.' });
      }
      if (!(await bcrypt.compare(currentPassword, rows[0].password))) {
        return res.status(401).json({ error: 'La contraseña actual no es correcta.' });
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

      await auditService.logAction({
        req,
        action: 'CAMBIO_CONTRASEÑA',
        module: 'Seguridad',
        details: `El usuario ${req.user.email} cambió su contraseña.`
      });

      return res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
      console.error('Error al cambiar contraseña en MySQL:', error);
      return res.status(500).json({ error: 'Error al cambiar contraseña.' });
    }
  },

  getMe: async (req, res) => {
    return res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
  }
};
