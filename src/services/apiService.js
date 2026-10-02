import { mockStorage } from './mockStorage';
import { initialServiciosSettings } from './initialData';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

const getAuthToken = () => {
  const authData = localStorage.getItem('alcaldia_leon_auth');
  if (authData) {
    try {
      return JSON.parse(authData).token || null;
    } catch {
      return null;
    }
  }
  return null;
};

const requestServices = async (path, { method = 'GET', data } = {}) => {
  const token = getAuthToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (data !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: data === undefined ? undefined : JSON.stringify(data)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'No se pudo guardar el contenido de servicios.');
  }
  return result;
};

export const apiService = {
  // 1. AUTENTICACIÓN & CAMBIO DE CONTRASEÑA
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('alcaldia_leon_auth', JSON.stringify({ user: data.user, token: data.token }));
        return data;
      }
    } catch (error) {
      console.warn('⚠️ Error conectando al backend en login, usando mockStorage:', error.message);
    }
    return mockStorage.login(email, password);
  },

  logout: async () => {
    localStorage.removeItem('alcaldia_leon_auth');
    return mockStorage.logout();
  },

  getCurrentUser: () => mockStorage.getCurrentUser(),

  changePassword: async (currentPassword, newPassword) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend cambio clave:', e.message);
    }
    return { success: true, message: 'Contraseña actualizada localmente.' };
  },

  // 2. AUDITORÍA Y BITÁCORA
  getAuditLogs: async () => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE_URL}/audit-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    return [];
  },

  // 3. GESTIÓN DE USUARIOS ADMINISTRADORES
  getUsers: async () => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    return [];
  },

  saveUser: async (userData) => {
    const token = getAuthToken();
    try {
      const isEdit = Boolean(userData.id);
      const url = isEdit ? `${API_BASE_URL}/users/${userData.id}` : `${API_BASE_URL}/users`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend saveUser:', e.message);
    }
    return [];
  },

  deleteUser: async (id) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend deleteUser:', e.message);
    }
    return [];
  },

  // 4. HERO / PORTADA
  getHero: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/hero`);
      if (res.ok) {
        const data = await res.json();
        // Guardar en mockStorage como respaldo
        mockStorage.updateHero(data);
        return data;
      }
    } catch (e) {
      console.warn('Backend hero no disponible, usando mockStorage:', e.message);
    }
    return mockStorage.getHero();
  },

  updateHero: async (data) => {
    const token = getAuthToken();
    // Actualizar siempre mockStorage para mantener sincronización local
    await mockStorage.updateHero(data);

    try {
      const res = await fetch(`${API_BASE_URL}/hero`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend updateHero:', e.message);
    }
    return mockStorage.getHero();
  },

  // 5. NOTICIAS
  getNoticias: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/noticias`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(item => ({
          id: item.id,
          title: item.title || item.titulo,
          summary: item.summary || item.extracto,
          content: item.content || item.contenido,
          category: item.category || item.categoria,
          img: item.img || item.imagen || item.image,
          image: item.img || item.imagen || item.image,
          author: item.author || item.autor,
          date: item.date,
          status: item.status || 'published',
          fuente: item.fuente || 'manual',
          url_externa: item.url_externa,
          external_id: item.external_id,
          created_at: item.created_at
        }));
        return formatted;
      }
    } catch (e) {
      console.warn('Backend noticias no disponible, usando mockStorage:', e.message);
    }
    return mockStorage.getNoticias();
  },

  saveNoticia: async (noticiaData) => {
    const token = getAuthToken();
    // 1. Sincronizar en mockStorage para actualización inmediata en cliente
    const mockUpdatedList = await mockStorage.saveNoticia(noticiaData);

    // 2. Intentar guardar en backend
    try {
      const isEdit = Boolean(noticiaData.id);
      const url = isEdit ? `${API_BASE_URL}/noticias/${noticiaData.id}` : `${API_BASE_URL}/noticias`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...noticiaData,
        title: noticiaData.title || noticiaData.titulo,
        summary: noticiaData.summary || noticiaData.extracto,
        content: noticiaData.content || noticiaData.contenido,
        category: noticiaData.category || noticiaData.categoria,
        img: noticiaData.image || noticiaData.img || noticiaData.imagen
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        return data.map(item => ({
          id: item.id,
          title: item.title || item.titulo,
          summary: item.summary || item.extracto,
          content: item.content || item.contenido,
          category: item.category || item.categoria,
          img: item.img || item.imagen || item.image,
          image: item.img || item.imagen || item.image,
          author: item.author || item.autor,
          date: item.date,
          status: item.status || 'published'
        }));
      }
    } catch (e) {
      console.warn('Error backend saveNoticia:', e.message);
    }
    return mockUpdatedList;
  },

  deleteNoticia: async (id) => {
    const token = getAuthToken();
    const mockUpdatedList = await mockStorage.deleteNoticia(id);
    try {
      const res = await fetch(`${API_BASE_URL}/noticias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return data.map(item => ({
          id: item.id,
          title: item.title || item.titulo,
          summary: item.summary || item.extracto,
          content: item.content || item.contenido,
          category: item.category || item.categoria,
          img: item.img || item.imagen || item.image,
          image: item.img || item.imagen || item.image,
          author: item.author || item.autor,
          date: item.date,
          status: item.status || 'published'
        }));
      }
    } catch (e) {
      console.warn('Error backend deleteNoticia:', e.message);
    }
    return mockUpdatedList;
  },

  syncFacebook: async () => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE_URL}/facebook/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error sync Facebook:', e.message);
    }
    return { success: false, error: 'Servidor no disponible para sincronización.' };
  },

  // 6. PROYECTOS
  getProyectos: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/proyectos`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('Backend proyectos no disponible, usando mockStorage:', e.message);
    }
    return mockStorage.getProyectos();
  },

  saveProyecto: async (data) => {
    const token = getAuthToken();
    const mockUpdatedList = await mockStorage.saveProyecto(data);

    try {
      const isEdit = Boolean(data.id);
      const url = isEdit ? `${API_BASE_URL}/proyectos/${data.id}` : `${API_BASE_URL}/proyectos`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend saveProyecto:', e.message);
    }
    return mockUpdatedList;
  },

  deleteProyecto: async (id) => {
    const token = getAuthToken();
    const mockUpdatedList = await mockStorage.deleteProyecto(id);
    try {
      const res = await fetch(`${API_BASE_URL}/proyectos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend deleteProyecto:', e.message);
    }
    return mockUpdatedList;
  },

  // 7. TURISMO
  getTurismo: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/turismo`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend turismo no disponible, usando mockStorage:', e.message);
    }
    return mockStorage.getTurismo();
  },

  saveTurismo: async (data) => {
    const token = getAuthToken();
    const mockUpdatedList = await mockStorage.saveTurismo(data);
    try {
      const isEdit = Boolean(data.id);
      const url = isEdit ? `${API_BASE_URL}/turismo/${data.id}` : `${API_BASE_URL}/turismo`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend saveTurismo:', e.message);
    }
    return mockUpdatedList;
  },

  deleteTurismo: async (id) => {
    const token = getAuthToken();
    const mockUpdatedList = await mockStorage.deleteTurismo(id);
    try {
      const res = await fetch(`${API_BASE_URL}/turismo/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend deleteTurismo:', e.message);
    }
    return mockUpdatedList;
  },

  // 8. CULTURA
  getCultura: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cultura`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend cultura no disponible, usando mockStorage:', e.message);
    }
    return mockStorage.getCultura();
  },

  saveCultura: async (data) => {
    const token = getAuthToken();
    const mockUpdatedList = await mockStorage.saveCultura(data);
    try {
      const isEdit = Boolean(data.id);
      const url = isEdit ? `${API_BASE_URL}/cultura/${data.id}` : `${API_BASE_URL}/cultura`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend saveCultura:', e.message);
    }
    return mockUpdatedList;
  },

  deleteCultura: async (id) => {
    const token = getAuthToken();
    const mockUpdatedList = await mockStorage.deleteCultura(id);
    try {
      const res = await fetch(`${API_BASE_URL}/cultura/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend deleteCultura:', e.message);
    }
    return mockUpdatedList;
  },

  // 9. ESTADÍSTICAS
  getStats: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend stats no disponible, usando mockStorage:', e.message);
    }
    return mockStorage.getStats();
  },

  saveStat: async (data) => {
    const token = getAuthToken();
    const mockUpdatedList = await mockStorage.saveStat(data);
    try {
      const isEdit = Boolean(data.id);
      const url = isEdit ? `${API_BASE_URL}/stats/${data.id}` : `${API_BASE_URL}/stats`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend saveStat:', e.message);
    }
    return mockUpdatedList;
  },

  deleteStat: async (id) => {
    const token = getAuthToken();
    const mockUpdatedList = await mockStorage.deleteStat(id);
    try {
      const res = await fetch(`${API_BASE_URL}/stats/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend deleteStat:', e.message);
    }
    return mockUpdatedList;
  },

  // 10. CONTACTO
  getContacto: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/contacto`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend contacto no disponible, usando mockStorage:', e.message);
    }
    return mockStorage.getContacto();
  },

  updateContacto: async (data) => {
    const token = getAuthToken();
    await mockStorage.updateContacto(data);
    try {
      const res = await fetch(`${API_BASE_URL}/contacto`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error backend updateContacto:', e.message);
    }
  },

  // 11. TRÁMITES Y SERVICIOS
  getServiciosSettings: async () => {
    try {
      return await requestServices('/servicios/settings');
    } catch (e) {
      console.warn('Backend configuración de servicios no disponible:', e.message);
      return initialServiciosSettings;
    }
  },

  saveServiciosSettings: async (data) => requestServices('/servicios/settings', {
    method: 'PUT',
    data
  }),

  getServicios: async () => {
    try {
      return await requestServices('/servicios');
    } catch (e) {
      console.warn('Backend servicios no disponible, usando mockStorage:', e.message);
      return mockStorage.getServicios();
    }
  },

  saveServicio: async (data) => {
    const isEdit = Boolean(data.id);
    const path = isEdit ? `/servicios/${encodeURIComponent(data.id)}` : '/servicios';
    return requestServices(path, { method: isEdit ? 'PUT' : 'POST', data });
  },

  deleteServicio: async (id) => {
    return requestServices(`/servicios/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  saveSubservicio: async (categoriaId, subservicioData) => {
    const isEdit = Boolean(subservicioData.id);
    const categoryPath = `/servicios/${encodeURIComponent(categoriaId)}/subservicios`;
    const path = isEdit ? `${categoryPath}/${encodeURIComponent(subservicioData.id)}` : categoryPath;
    return requestServices(path, { method: isEdit ? 'PUT' : 'POST', data: subservicioData });
  },

  deleteSubservicio: async (categoriaId, subservicioId) => {
    const path = `/servicios/${encodeURIComponent(categoriaId)}/subservicios/${encodeURIComponent(subservicioId)}`;
    return requestServices(path, { method: 'DELETE' });
  },

  getCentrosAtencion: () => mockStorage.getCentrosAtencion(),
  saveCentrosAtencion: (data) => mockStorage.saveCentrosAtencion(data),
  getRedesSociales: () => mockStorage.getRedesSociales(),
  saveRedesSociales: (data) => mockStorage.saveRedesSociales(data),

  resetToDefault: () => mockStorage.resetToDefault()
};
