import { db } from '../config/firebase.js';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore/lite';
import { auditService } from '../services/auditService.js';
import bcrypt from 'bcryptjs';

let mockUsers = [
  {
    id: 'u-1',
    name: 'Administrador General',
    email: 'admin@alcaldaleon.gob.ni',
    role: 'superadmin',
    avatar: '/img/nav_logo/logo nav2.png',
    created_at: new Date().toISOString()
  }
];

export const usersController = {
  getAll: async (req, res) => {
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, 'users'));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const { password, ...userWithoutPassword } = data;
            return { id: docSnap.id, ...userWithoutPassword };
          });
          return res.json(list);
        }
      }
      return res.json(mockUsers);
    } catch (error) {
      return res.json(mockUsers);
    }
  },

  create: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const id = `u-${Date.now()}`;
      const newUser = {
        id,
        name,
        email,
        password: hashedPassword,
        role: role || 'editor',
        avatar: '/img/nav_logo/logo nav2.png',
        created_at: new Date().toISOString()
      };

      try {
        if (db) {
          await setDoc(doc(db, 'users', id), newUser);
        } else {
          mockUsers.push(newUser);
        }
      } catch (fbErr) {
        mockUsers.push(newUser);
      }

      await auditService.logAction({
        req,
        action: 'CREAR_USUARIO',
        module: 'Usuarios',
        details: `Nuevo usuario creado: ${email} con rol [${newUser.role}]`
      });

      return usersController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al registrar nuevo usuario.' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, role, password } = req.body;

      const updates = { name, role, updated_at: new Date().toISOString() };
      if (password) {
        updates.password = await bcrypt.hash(password, 10);
      }

      try {
        if (db) {
          await setDoc(doc(db, 'users', id), updates);
        } else {
          const idx = mockUsers.findIndex(u => u.id === id);
          if (idx !== -1) mockUsers[idx] = { ...mockUsers[idx], ...updates };
        }
      } catch (fbErr) {
        const idx = mockUsers.findIndex(u => u.id === id);
        if (idx !== -1) mockUsers[idx] = { ...mockUsers[idx], ...updates };
      }

      await auditService.logAction({
        req,
        action: 'EDITAR_USUARIO',
        module: 'Usuarios',
        details: `Usuario ${id} actualizado`
      });

      return usersController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar usuario.' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (id === req.user.id) {
        return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de usuario.' });
      }

      try {
        if (db) {
          await deleteDoc(doc(db, 'users', id));
        } else {
          mockUsers = mockUsers.filter(u => u.id !== id);
        }
      } catch (fbErr) {
        mockUsers = mockUsers.filter(u => u.id !== id);
      }

      await auditService.logAction({
        req,
        action: 'ELIMINAR_USUARIO',
        module: 'Usuarios',
        details: `Usuario ${id} eliminado`
      });

      return usersController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar usuario.' });
    }
  }
};
