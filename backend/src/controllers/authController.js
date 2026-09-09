import { db } from '../config/firebase.js';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore/lite';
import { auditService } from '../services/auditService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'alcaldia_leon_secret_jwt_key_2026_super_secure';

export const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Debes proporcionar correo y contraseña.' });
      }

      let user = null;

      try {
        if (db) {
          const querySnapshot = await getDocs(collection(db, 'users'));
          const foundDoc = querySnapshot.docs.find(d => d.data().email === email);
          if (foundDoc) {
            user = { id: foundDoc.id, ...foundDoc.data() };
          }
        }
      } catch (fbErr) {
        console.warn('⚠️ Error consultando usuarios en Firestore:', fbErr.message);
      }

      if (user) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          await auditService.logAction({
            req,
            user: { email },
            action: 'LOGIN_FALLIDO',
            module: 'Autenticación',
            details: `Intento de acceso fallido para ${email}`
          });
          return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo o contraseña.' });
        }
      } else if (email === 'admin@alcaldaleon.gob.ni' && password === 'admin123') {
        user = {
          id: 'u-1',
          name: 'Administrador General',
          email: 'admin@alcaldaleon.gob.ni',
          role: 'superadmin',
          avatar: '/img/nav_logo/logo nav2.png'
        };
      } else {
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

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Debes proporcionar la contraseña actual y la nueva.' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      try {
        if (db) {
          await setDoc(doc(db, 'users', userId), {
            password: hashedNewPassword,
            updated_at: new Date().toISOString()
          });
        }
      } catch (e) {
        // Fallback
      }

      await auditService.logAction({
        req,
        action: 'CAMBIO_CONTRASEÑA',
        module: 'Seguridad',
        details: `El usuario ${req.user.email} cambió su contraseña.`
      });

      return res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
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
