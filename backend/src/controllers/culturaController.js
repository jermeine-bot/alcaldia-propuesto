import { db } from '../config/firebase.js';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore/lite';

let mockCultura = [
  {
    id: 'cultura-1',
    icon: 'fa-cross',
    title: 'Semana Santa y Alfombras de Aserrín',
    desc: 'La tradición religiosa y artística más impresionante confeccionada en las calles de Sutiaba.',
    event_date: 'Marzo / Abril 2026',
    event_time: 'Todo el día',
    location: 'Barrio Sutiaba, León',
    image_url: '/img/cultura/semana_santa.jpg',
    is_published: true
  },
  {
    id: 'cultura-2',
    icon: 'fa-fist-raised',
    title: 'La Gritería en Honor a la Purísima',
    desc: 'La fiesta mariana más alegre, colorida y multitudinaria de Nicaragua.',
    event_date: '7 de Diciembre',
    event_time: '6:00 PM',
    location: 'Catedral y barrios de León',
    image_url: '/img/cultura/griteria.jpg',
    is_published: true
  }
];

export const culturaController = {
  getAll: async (req, res) => {
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, 'cultura'));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          return res.json(list);
        }
      }
      return res.json(mockCultura);
    } catch (error) {
      console.warn('⚠️ Error al leer cultura en Firestore:', error.message);
      return res.json(mockCultura);
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      const id = data.id || `cultura-${Date.now()}`;
      const newItem = {
        ...data,
        id,
        is_published: data.is_published ?? true,
        created_at: new Date().toISOString()
      };

      try {
        if (db) {
          await setDoc(doc(db, 'cultura', id), newItem);
        } else {
          mockCultura.push(newItem);
        }
      } catch (fbErr) {
        mockCultura.push(newItem);
      }

      return culturaController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al registrar evento cultural.' });
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
          await setDoc(doc(db, 'cultura', id), updates);
        } else {
          const idx = mockCultura.findIndex(c => c.id === id);
          if (idx !== -1) mockCultura[idx] = { ...mockCultura[idx], ...updates };
        }
      } catch (fbErr) {
        const idx = mockCultura.findIndex(c => c.id === id);
        if (idx !== -1) mockCultura[idx] = { ...mockCultura[idx], ...updates };
      }

      return culturaController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar evento cultural.' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      try {
        if (db) {
          await deleteDoc(doc(db, 'cultura', id));
        } else {
          mockCultura = mockCultura.filter(c => c.id !== id);
        }
      } catch (fbErr) {
        mockCultura = mockCultura.filter(c => c.id !== id);
      }
      return culturaController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar evento cultural.' });
    }
  }
};
