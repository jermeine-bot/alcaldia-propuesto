import { db } from '../config/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore/lite';

let mockContacto = {
  id: 'contacto-1',
  address: 'Palacio Municipal, Frente al Parque Central, León, Nicaragua',
  phone: '+505 2315-0000',
  secondary_phone: '+505 2315-1111',
  email: 'info@alcaldaleon.gob.ni',
  schedule: 'Lunes a Viernes: 8:00 AM - 4:00 PM',
  facebook_url: 'https://www.facebook.com/share/1EJ2g1UpjY/',
  instagram_url: 'https://www.instagram.com/alcaldia_leon',
  tiktok_url: 'https://www.tiktok.com/@leonalcaldia',
  youtube_url: 'https://www.youtube.com/@AlcaldiaLeon',
  twitter_url: 'https://twitter.com/alcaldia_leon'
};

export const contactoController = {
  getContacto: async (req, res) => {
    try {
      if (db) {
        const docSnap = await getDoc(doc(db, 'contacto', 'contacto-1'));
        if (docSnap.exists()) {
          return res.json({ id: docSnap.id, ...docSnap.data() });
        }
      }
      return res.json(mockContacto);
    } catch (error) {
      console.warn('⚠️ Error al leer contacto en Firestore:', error.message);
      return res.json(mockContacto);
    }
  },

  updateContacto: async (req, res) => {
    try {
      const data = req.body;
      const updated = {
        ...data,
        id: 'contacto-1',
        updated_at: new Date().toISOString()
      };

      try {
        if (db) {
          await setDoc(doc(db, 'contacto', 'contacto-1'), updated);
        } else {
          mockContacto = { ...mockContacto, ...updated };
        }
      } catch (fbErr) {
        mockContacto = { ...mockContacto, ...updated };
      }

      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar información de contacto.' });
    }
  }
};
