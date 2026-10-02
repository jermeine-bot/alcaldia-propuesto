import { randomUUID } from 'node:crypto';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore/lite';
import { db } from '../config/firebase.js';
import { initialServiciosData, initialServiciosSettings } from '../../../src/services/initialData.js';

const cloneInitialServices = () => initialServiciosData.map((item, index) => ({
  ...item,
  display_order: index,
  opciones: (item.opciones || []).map(option => ({ ...option }))
}));

let mockServicios = cloneInitialServices();

const sortServices = items => items.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

const readServices = async () => {
  if (!db) return mockServicios;

  const servicesRef = collection(db, 'servicios');
  let snapshot = await getDocs(servicesRef);
  const metadataRef = doc(db, 'cmsMetadata', 'servicios');
  const metadata = await getDoc(metadataRef);

  if (!metadata.data()?.initialized_at) {
    if (snapshot.empty) {
      const defaults = cloneInitialServices();
      await Promise.all(defaults.map(item => setDoc(doc(db, 'servicios', item.id), item)));
      snapshot = await getDocs(servicesRef);
    }
    await setDoc(metadataRef, { initialized_at: new Date().toISOString() }, { merge: true });
  }

  return sortServices(snapshot.docs.map(serviceDoc => ({ id: serviceDoc.id, ...serviceDoc.data() })));
};

const sendError = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({ error: message });
};

export const serviciosController = {
  getSettings: async (_req, res) => {
    try {
      const metadata = await getDoc(doc(db, 'cmsMetadata', 'servicios'));
      const stored = metadata.exists() ? metadata.data() : {};
      return res.json({
        eyebrow: stored.eyebrow || initialServiciosSettings.eyebrow,
        title: stored.title || initialServiciosSettings.title,
        description: stored.description || initialServiciosSettings.description,
        phone: stored.phone || initialServiciosSettings.phone
      });
    } catch (error) {
      console.warn('No se pudo leer la configuración de servicios:', error.message);
      return res.json(initialServiciosSettings);
    }
  },

  updateSettings: async (req, res) => {
    try {
      const settings = {
        eyebrow: String(req.body.eyebrow || '').trim(),
        title: String(req.body.title || '').trim(),
        description: String(req.body.description || '').trim(),
        phone: String(req.body.phone || '').trim()
      };
      if (Object.values(settings).some(value => !value)) {
        return res.status(400).json({ error: 'Completa todos los campos de la sección.' });
      }

      await setDoc(doc(db, 'cmsMetadata', 'servicios'), settings, { merge: true });
      return res.json(settings);
    } catch (error) {
      return sendError(res, error, 'No se pudo actualizar la sección de servicios.');
    }
  },

  getAll: async (_req, res) => {
    try {
      return res.json(await readServices());
    } catch (error) {
      console.warn('No se pudieron leer los servicios desde Firestore:', error.message);
      return res.json(mockServicios);
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      if (!data.title || !data.subtitle) {
        return res.status(400).json({ error: 'El título y el subtítulo son obligatorios.' });
      }

      const services = await readServices();
      const id = `servicio-${randomUUID()}`;
      const service = {
        ...data,
        id,
        opciones: Array.isArray(data.opciones) ? data.opciones : [],
        count: Array.isArray(data.opciones) ? data.opciones.length : 0,
        display_order: services.length,
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'servicios', id), service);
      return res.json(await readServices());
    } catch (error) {
      return sendError(res, error, 'No se pudo crear la categoría de servicios.');
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const serviceRef = doc(db, 'servicios', id);
      const existing = await getDoc(serviceRef);
      if (!existing.exists()) {
        return res.status(404).json({ error: 'No se encontró la categoría de servicios.' });
      }

      const data = req.body;
      if (!data.title || !data.subtitle) {
        return res.status(400).json({ error: 'El título y el subtítulo son obligatorios.' });
      }

      const current = existing.data();
      const opciones = Array.isArray(data.opciones) ? data.opciones : current.opciones || [];
      await setDoc(serviceRef, {
        ...current,
        ...data,
        id,
        opciones,
        count: opciones.length,
        updated_at: new Date().toISOString()
      });
      return res.json(await readServices());
    } catch (error) {
      return sendError(res, error, 'No se pudo actualizar la categoría de servicios.');
    }
  },

  delete: async (req, res) => {
    try {
      await deleteDoc(doc(db, 'servicios', req.params.id));
      return res.json(await readServices());
    } catch (error) {
      return sendError(res, error, 'No se pudo eliminar la categoría de servicios.');
    }
  },

  saveSubservicio: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      if (!data.title || !data.desc) {
        return res.status(400).json({ error: 'El nombre y la descripción del trámite son obligatorios.' });
      }

      const serviceRef = doc(db, 'servicios', id);
      const snapshot = await getDoc(serviceRef);
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'No se encontró la categoría de servicios.' });
      }

      const service = snapshot.data();
      const options = [...(service.opciones || [])];
      const optionId = data.id || `opcion-${randomUUID()}`;
      const index = options.findIndex(option => option.id === optionId);
      const option = { ...data, id: optionId };
      if (index === -1) options.push(option);
      else options[index] = { ...options[index], ...option };

      await setDoc(serviceRef, {
        ...service,
        opciones: options,
        count: options.length,
        updated_at: new Date().toISOString()
      });
      return res.json(await readServices());
    } catch (error) {
      return sendError(res, error, 'No se pudo guardar el trámite o servicio.');
    }
  },

  deleteSubservicio: async (req, res) => {
    try {
      const { id, subservicioId } = req.params;
      const serviceRef = doc(db, 'servicios', id);
      const snapshot = await getDoc(serviceRef);
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'No se encontró la categoría de servicios.' });
      }

      const service = snapshot.data();
      const options = (service.opciones || []).filter(option => option.id !== subservicioId);
      await setDoc(serviceRef, {
        ...service,
        opciones: options,
        count: options.length,
        updated_at: new Date().toISOString()
      });
      return res.json(await readServices());
    } catch (error) {
      return sendError(res, error, 'No se pudo eliminar el trámite o servicio.');
    }
  }
};