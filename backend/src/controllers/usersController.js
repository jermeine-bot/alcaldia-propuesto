import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { auditService } from '../services/auditService.js';

const listUsers = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, avatar, created_at, updated_at FROM users ORDER BY created_at ASC'
  );
  return rows;
};

export const usersController = {
  getAll: async (_req, res) => {
    try {
      return res.json(await listUsers());
    } catch (error) {
      console.error('Error al consultar usuarios en MySQL:', error);
      return res.status(500).json({ error: 'No se pudieron consultar los usuarios.' });
    }
  },

  create: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name?.trim() || !email?.trim() || !password) {
        return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
      }
      const id = randomUUID();
      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role || 'editor';
      await pool.query(
        'INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name.trim(), email.trim().toLowerCase(), hashedPassword, userRole, '/img/nav_logo/logo nav2.png']
      );
      await auditService.logAction({
        req,
        action: 'CREAR_USUARIO',
        module: 'Usuarios',
        details: `Nuevo usuario creado: ${email} con rol [${userRole}]`
      });
      return res.status(201).json(await listUsers());
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Ya existe un usuario con ese correo.' });
      }
      console.error('Error al registrar usuario en MySQL:', error);
      return res.status(500).json({ error: 'Error al registrar nuevo usuario.' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, role, password } = req.body;
      const updates = [];
      const values = [];
      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name.trim());
      }
      if (role !== undefined) {
        updates.push('role = ?');
        values.push(role);
      }
      if (password) {
        updates.push('password = ?');
        values.push(await bcrypt.hash(password, 10));
      }
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
      }
      const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'No se encontró el usuario.' });
      }
      values.push(id);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
      await auditService.logAction({
        req,
        action: 'EDITAR_USUARIO',
        module: 'Usuarios',
        details: `Usuario ${id} actualizado`
      });
      return res.json(await listUsers());
    } catch (error) {
      console.error('Error al actualizar usuario en MySQL:', error);
      return res.status(500).json({ error: 'Error al actualizar usuario.' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (id === req.user.id) {
        return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de usuario.' });
      }
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'No se encontró el usuario.' });
      }
      await auditService.logAction({
        req,
        action: 'ELIMINAR_USUARIO',
        module: 'Usuarios',
        details: `Usuario ${id} eliminado`
      });
      return res.json(await listUsers());
    } catch (error) {
      console.error('Error al eliminar usuario en MySQL:', error);
      return res.status(500).json({ error: 'Error al eliminar usuario.' });
    }
  }
};
