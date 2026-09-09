import { db } from '../config/firebase.js';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore/lite';

let mockProyectos = [
  {
    id: 'proyecto-1',
    img: '/img/proyectos/proyecto1.jpg',
    category: 'Infraestructura',
    status: 'En Progreso',
    isCompleted: false,
    title: 'Parque Lineal del Río Chiquito',
    desc: 'Recuperación ambiental, reforestación y creación de senderos ecológicos y espacios recreativos para familias leonesas.',
    detailed_desc: 'Este mega proyecto contempla la limpieza integral del cauce, siembra de más de 5,000 árboles nativos, instalación de luminarias solares y construcción de ciclovías.',
    location: 'Río Chiquito, León',
    cost: 'C$ 45.2M',
    progress: 68,
    startDate: 'Enero 2024',
    beneficiaries: '35,000 Habitantes',
    is_published: true
  },
  {
    id: 'proyecto-2',
    img: '/img/proyectos/proyecto2.jpg',
    category: 'Comercio & Economía',
    status: 'Completado',
    isCompleted: true,
    title: 'Modernización del Mercado Municipal Santos Bárcenas',
    desc: 'Renovación de tramos, sistema eléctrico moderno, agua potable y accesibilidad universal para comerciantes y clientes.',
    detailed_desc: 'Rehabilitación total de techo, nuevo sistema contra incendios y ordenamiento de más de 300 tramos comerciales para garantizar compras seguras y cómodas.',
    location: 'Centro Histórico, León',
    cost: 'C$ 32.8M',
    progress: 100,
    startDate: 'Julio 2023',
    beneficiaries: '50,000 Habitantes',
    is_published: true
  }
];

export const proyectosController = {
  getAll: async (req, res) => {
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, 'proyectos'));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          return res.json(list);
        }
      }
      return res.json(mockProyectos);
    } catch (error) {
      console.warn('⚠️ Error al leer proyectos en Firestore:', error.message);
      return res.json(mockProyectos);
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      const progressNum = Number(data.progress || 0);
      const isCompleted = progressNum === 100;
      const statusText = isCompleted ? 'Completado' : 'En Progreso';

      const id = data.id || `proyecto-${Date.now()}`;
      const newItem = {
        ...data,
        id,
        progress: progressNum,
        isCompleted,
        status: statusText,
        created_at: new Date().toISOString()
      };

      try {
        if (db) {
          await setDoc(doc(db, 'proyectos', id), newItem);
        } else {
          mockProyectos.unshift(newItem);
        }
      } catch (fbErr) {
        mockProyectos.unshift(newItem);
      }

      return proyectosController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al registrar el proyecto.' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const progressNum = Number(data.progress !== undefined ? data.progress : 0);
      const isCompleted = progressNum === 100;
      const statusText = isCompleted ? 'Completado' : 'En Progreso';

      const updates = {
        ...data,
        progress: progressNum,
        isCompleted,
        status: statusText,
        updated_at: new Date().toISOString()
      };

      try {
        if (db) {
          await setDoc(doc(db, 'proyectos', id), updates);
        } else {
          const idx = mockProyectos.findIndex(p => p.id === id);
          if (idx !== -1) mockProyectos[idx] = { ...mockProyectos[idx], ...updates };
        }
      } catch (fbErr) {
        const idx = mockProyectos.findIndex(p => p.id === id);
        if (idx !== -1) mockProyectos[idx] = { ...mockProyectos[idx], ...updates };
      }

      return proyectosController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar el proyecto.' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      try {
        if (db) {
          await deleteDoc(doc(db, 'proyectos', id));
        } else {
          mockProyectos = mockProyectos.filter(p => p.id !== id);
        }
      } catch (fbErr) {
        mockProyectos = mockProyectos.filter(p => p.id !== id);
      }
      return proyectosController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar el proyecto.' });
    }
  }
};
