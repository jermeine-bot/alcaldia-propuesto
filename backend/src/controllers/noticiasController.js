import { db } from '../config/firebase.js';
import { collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore/lite';
import { auditService } from '../services/auditService.js';
import fs from 'fs';

let mockNoticias = [
  {
    id: 'noticia-1',
    titulo: 'Inauguración del nuevo Parque Central',
    slug: 'inauguracion-del-nuevo-parque-central',
    extracto: 'Un espacio renovado para el disfrute de todas las familias leonesas.',
    contenido: 'La Alcaldía Municipal de León se enorgullece en inaugurar las obras de remodelación y embellecimiento del Parque Central.',
    categoria: 'Obras Públicas',
    imagen: '/img/noticias/noticia1.jpg',
    autor: 'Prensa Alcaldía',
    date: '15 Enero 2026',
    status: 'published',
    fuente: 'manual'
  },
  {
    id: 'noticia-2',
    titulo: 'Nuevo sistema de recolección de basura',
    slug: 'nuevo-sistema-de-recoleccion-de-basura',
    extracto: 'Modernizamos el servicio para una ciudad más limpia y sostenible.',
    contenido: 'Con la incorporación de una flota de camiones recolectores modernos.',
    categoria: 'Servicios Municipales',
    imagen: '/img/noticias/noticia2.jpg',
    autor: 'Dirección de Ornato',
    date: '12 Enero 2026',
    status: 'published',
    fuente: 'manual'
  }
];

const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
};

export const noticiasController = {
  getAll: async (req, res) => {
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, 'noticias'));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          return res.json(list);
        }
      }
      return res.json(mockNoticias);
    } catch (error) {
      console.warn('⚠️ Leyendo modo memoria/local para noticias:', error.message);
      return res.json(mockNoticias);
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      if (db) {
        const docSnap = await getDoc(doc(db, 'noticias', id));
        if (docSnap.exists()) {
          return res.json({ id: docSnap.id, ...docSnap.data() });
        }
      }
      const localItem = mockNoticias.find(n => n.id === id);
      if (!localItem) return res.status(404).json({ error: 'Noticia no encontrada' });
      return res.json(localItem);
    } catch (error) {
      const localItem = mockNoticias.find(n => n.id === id);
      if (!localItem) return res.status(404).json({ error: 'Noticia no encontrada' });
      return res.json(localItem);
    }
  },

  create: async (req, res) => {
    try {
      const { title, titulo, summary, extracto, content, contenido, category, categoria, img, imagen, author, autor, date, status, fuente, url_externa, external_id } = req.body;

      const finalTitle = title || titulo;
      if (!finalTitle) return res.status(400).json({ error: 'El título de la noticia es obligatorio.' });

      const id = `noticia-${Date.now()}`;
      const slug = generateSlug(finalTitle);
      const finalExtracto = summary || extracto || '';
      const finalContenido = content || contenido || '';
      const finalCategoria = category || categoria || 'General';
      const finalImagen = img || imagen || '/img/hero-bg.jpg';
      const finalAutor = author || autor || 'Prensa Alcaldía';
      const finalDate = date || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      const finalStatus = status || 'published';
      const finalFuente = fuente || 'manual';

      const payload = {
        id,
        titulo: finalTitle,
        title: finalTitle,
        slug,
        extracto: finalExtracto,
        summary: finalExtracto,
        contenido: finalContenido,
        content: finalContenido,
        categoria: finalCategoria,
        category: finalCategoria,
        imagen: finalImagen,
        img: finalImagen,
        autor: finalAutor,
        author: finalAutor,
        date: finalDate,
        status: finalStatus,
        fuente: finalFuente,
        url_externa: url_externa || null,
        external_id: external_id || null,
        created_at: new Date().toISOString()
      };

      try {
        if (db) {
          await setDoc(doc(db, 'noticias', id), payload);
        } else {
          mockNoticias.unshift(payload);
        }
      } catch (fbErr) {
        console.warn('⚠️ Error guardando en Firestore:', fbErr.message);
        mockNoticias.unshift(payload);
      }

      await auditService.logAction({
        req,
        action: 'CREAR_NOTICIA',
        module: 'Noticias',
        details: `Noticia creada: "${finalTitle}"`
      });

      return noticiasController.getAll(req, res);
    } catch (error) {
      console.error('Error al crear noticia:', error);
      return res.status(500).json({ error: 'Error al crear la noticia.' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, titulo, summary, extracto, content, contenido, category, categoria, img, imagen, author, autor, date, status } = req.body;

      const finalTitle = title || titulo;
      const slug = generateSlug(finalTitle);

      const updates = {
        titulo: finalTitle,
        title: finalTitle,
        slug,
        extracto: summary || extracto,
        summary: summary || extracto,
        contenido: content || contenido,
        content: content || contenido,
        categoria: category || categoria,
        category: category || categoria,
        imagen: img || imagen,
        img: img || imagen,
        autor: author || autor,
        author: author || autor,
        date,
        status,
        updated_at: new Date().toISOString()
      };

      try {
        if (db) {
          await updateDoc(doc(db, 'noticias', id), updates);
        } else {
          const idx = mockNoticias.findIndex(n => n.id === id);
          if (idx !== -1) mockNoticias[idx] = { ...mockNoticias[idx], ...updates };
        }
      } catch (fbErr) {
        const idx = mockNoticias.findIndex(n => n.id === id);
        if (idx !== -1) mockNoticias[idx] = { ...mockNoticias[idx], ...updates };
      }

      await auditService.logAction({
        req,
        action: 'EDITAR_NOTICIA',
        module: 'Noticias',
        details: `Noticia actualizada ID: ${id}`
      });

      return noticiasController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar noticia.' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      try {
        if (db) {
          await deleteDoc(doc(db, 'noticias', id));
        } else {
          mockNoticias = mockNoticias.filter(n => n.id !== id);
        }
      } catch (fbErr) {
        mockNoticias = mockNoticias.filter(n => n.id !== id);
      }

      await auditService.logAction({
        req,
        action: 'ELIMINAR_NOTICIA',
        module: 'Noticias',
        details: `Noticia eliminada ID: ${id}`
      });

      return noticiasController.getAll(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar la noticia.' });
    }
  },

  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se seleccionó ninguna imagen.' });
      }
      return res.json({ url: `/uploads/${req.file.filename}` });
    } catch (error) {
      return res.status(500).json({ error: 'Error al procesar la imagen.' });
    }
  }
};
