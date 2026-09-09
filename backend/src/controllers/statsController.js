import { db } from '../config/firebase.js';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore/lite';

let mockStats = [
  {
    id: 'stat-1',
    icon: 'fa-users',
    number: 210500,
    suffix: '+',
    title: 'Población Estimada',
    subtitle: 'Habitantes en el área urbana y comarcas rurales de León',
    category: 'Población',
    badge: 'Demografía',
    percentage: 85,
    color: '#B22222',
    is_published: true,
    display_order: 1
  },
  {
    id: 'stat-2',
    icon: 'fa-map-marked-alt',
    number: 820,
    suffix: ' km²',
    title: 'Extensión Territorial',
    subtitle: 'Área urbana y rural del municipio de León',
    category: 'Geografía',
    badge: 'Territorio',
    percentage: 100,
    color: '#1E1D1B',
    is_published: true,
    display_order: 2
  }
];

export const statsController = {
  getAll: async (req, res) => {
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, 'stats'));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          return res.json(list);
        }
      }
      return res.json(mockStats);
    } catch (error) {
      console.warn('⚠️ Error al leer stats en Firestore:', error.message);
      return res.json(mockStats);
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      const id = data.id || `stat-${Date.now()}`;
      const newItem = {
        ...data,
        id,
        is_published: data.is_published ?? true,
        created_at: new Date().toISOString()
      };

      try {
        if (db) {
          await setDoc(doc(db, 'stats', id), newItem);
        } else {
          mockStats.push(newItem);
        }
      } catch (fbErr) {
        mockStats.push(newItem);
      }

      return statsController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al registrar estadística.' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const updates = {
        ...data,
        updated_at: new Date().toISOString()
      };

      try {
        if (db) {
          await setDoc(doc(db, 'stats', id), updates);
        } else {
          const idx = mockStats.findIndex(s => s.id === id);
          if (idx !== -1) mockStats[idx] = { ...mockStats[idx], ...updates };
        }
      } catch (fbErr) {
        const idx = mockStats.findIndex(s => s.id === id);
        if (idx !== -1) mockStats[idx] = { ...mockStats[idx], ...updates };
      }

      return statsController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar estadística.' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      try {
        if (db) {
          await deleteDoc(doc(db, 'stats', id));
        } else {
          mockStats = mockStats.filter(s => s.id !== id);
        }
      } catch (fbErr) {
        mockStats = mockStats.filter(s => s.id !== id);
      }
      return statsController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar estadística.' });
    }
  }
};
