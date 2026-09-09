import { db } from '../config/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore/lite';

let mockHero = {
  id: 'hero-1',
  title: 'Bienvenidos a la Alcaldía Municipal de León',
  subtitle: 'Construyendo juntos el futuro de nuestra ciudad, con transparencia, innovación y compromiso con cada leonés.',
  video_url: '/video/leon nicaragua vista de un dron.mp4',
  fallback_image_url: '/img/hero-bg.jpg',
  primary_btn_text: 'Conoce León',
  primary_btn_link: '#turismo',
  secondary_btn_text: 'Servicios Rápidos',
  secondary_btn_link: '#servicios',
  is_active: true
};

export const heroController = {
  getHero: async (req, res) => {
    try {
      if (db) {
        const docSnap = await getDoc(doc(db, 'hero', 'hero-1'));
        if (docSnap.exists()) {
          return res.json({ id: docSnap.id, ...docSnap.data() });
        }
      }
      return res.json(mockHero);
    } catch (error) {
      console.warn('⚠️ Error al consultar Hero en Firestore:', error.message);
      return res.json(mockHero);
    }
  },

  updateHero: async (req, res) => {
    try {
      const data = req.body;
      const updated = {
        ...data,
        id: 'hero-1',
        updated_at: new Date().toISOString()
      };

      try {
        if (db) {
          await setDoc(doc(db, 'hero', 'hero-1'), updated);
        } else {
          mockHero = { ...mockHero, ...updated };
        }
      } catch (fbErr) {
        mockHero = { ...mockHero, ...updated };
      }

      return res.json(updated);
    } catch (error) {
      console.error('Error al actualizar Hero:', error);
      return res.status(500).json({ error: 'Error al actualizar la configuración de portada.' });
    }
  }
};
