import { db } from '../config/firebase.js';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore/lite';

let mockTurismo = [
  {
    id: 'turismo-1',
    img: '/img/turismo/catedral.jpg',
    title: 'Basílica Catedral de León',
    desc: 'La catedral más grande de Centroamérica y Patrimonio de la Humanidad UNESCO.',
    category: 'Patrimonio & Historia',
    location: 'Plaza Mayor, Centro Histórico',
    content: 'La Real e Insigne Basílica Catedral de la Asunción de la Bienaventurada Virgen María es uno de los monumentos más icónicos de América Latina. En sus criptas descansan los restos del insigne poeta Rubén Darío.',
    is_published: true,
    display_order: 1
  },
  {
    id: 'turismo-2',
    img: '/img/turismo/leon-viejo.jpg',
    title: 'Ruinas de León Viejo',
    desc: 'Primer asentamiento de la ciudad y Patrimonio Cultural UNESCO.',
    category: 'Patrimonio UNESCO',
    location: 'Puerto Momotombo',
    content: 'Fundada en 1524 por Francisco Hernández de Córdoba al pie del volcán Momotombo. Sepultada por las cenizas volcánicas, conserva el trazado urbano original del siglo XVI.',
    is_published: true,
    display_order: 2
  }
];

export const turismoController = {
  getAll: async (req, res) => {
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, 'turismo'));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          return res.json(list);
        }
      }
      return res.json(mockTurismo);
    } catch (error) {
      console.warn('⚠️ Error al leer turismo en Firestore:', error.message);
      return res.json(mockTurismo);
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      const id = data.id || `turismo-${Date.now()}`;
      const newItem = {
        ...data,
        id,
        is_published: data.is_published ?? true,
        created_at: new Date().toISOString()
      };

      try {
        if (db) {
          await setDoc(doc(db, 'turismo', id), newItem);
        } else {
          mockTurismo.push(newItem);
        }
      } catch (fbErr) {
        mockTurismo.push(newItem);
      }

      return turismoController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al registrar destino turístico.' });
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
          await setDoc(doc(db, 'turismo', id), updates);
        } else {
          const idx = mockTurismo.findIndex(t => t.id === id);
          if (idx !== -1) mockTurismo[idx] = { ...mockTurismo[idx], ...updates };
        }
      } catch (fbErr) {
        const idx = mockTurismo.findIndex(t => t.id === id);
        if (idx !== -1) mockTurismo[idx] = { ...mockTurismo[idx], ...updates };
      }

      return turismoController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar destino turístico.' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      try {
        if (db) {
          await deleteDoc(doc(db, 'turismo', id));
        } else {
          mockTurismo = mockTurismo.filter(t => t.id !== id);
        }
      } catch (fbErr) {
        mockTurismo = mockTurismo.filter(t => t.id !== id);
      }
      return turismoController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar destino turístico.' });
    }
  }
};
