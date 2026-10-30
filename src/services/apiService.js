const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5505/api').replace(/\/+$/, '');
const AUTH_STORAGE_KEY = 'alcaldia_cms_auth';
let authData = null;

const readStoredAuth = () => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistAuth = () => {
  try {
    if (typeof window === 'undefined') return;
    if (authData) {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } else {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Si el almacenamiento no está disponible, la sesión sigue solo en memoria.
  }
};

authData = readStoredAuth();

const getAuthData = () => authData;

const applyAuthResult = (result) => {
  if (!result?.token) return result;
  authData = {
    token: result.token,
    user: result.user || authData?.user || null
  };
  persistAuth();
  try {
    window.dispatchEvent(new Event('alcaldia-auth-updated'));
  } catch {
    // Sin window (por ejemplo, en pruebas) no hay nada que notificar.
  }
  return result;
};

const request = async (path, { method = 'GET', data, authenticated = true } = {}) => {
  const headers = {};
  const token = authenticated ? getAuthData()?.token : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (data !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: data === undefined ? undefined : JSON.stringify(data)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      authData = null;
      persistAuth();
    }
    throw new Error(result.error || `La solicitud a ${path} falló.`);
  }
  return result;
};

const normalizeNews = items => {
  if (!items) return [];
  const list = Array.isArray(items) ? items : [items];
  const mapped = list.map(item => {
    const rawLink = item.linkUrl || item.linkurl || item.url || item.url_externa || item.urlExterna || '';
    return {
      id: item.id,
      title: item.title || item.titulo,
      summary: item.summary || item.extracto,
      content: item.content || item.contenido,
      category: item.category || item.categoria,
      img: item.img || item.imagen || item.image,
      image: item.img || item.imagen || item.image,
      author: item.author || item.autor,
      date: item.date || item.fecha || '',
      status: item.status || 'published',
      fuente: item.fuente || 'manual',
      url_externa: rawLink,
      linkUrl: rawLink,
      url: rawLink,
      external_id: item.external_id,
      created_at: item.created_at
    };
  });
  return Array.isArray(items) ? mapped : mapped[0];
};

const saveItem = (resource, data) => {
  const isEdit = Boolean(data.id);
  const id = isEdit ? `/${encodeURIComponent(data.id)}` : '';
  return request(`/${resource}${id}`, {
    method: isEdit ? 'PUT' : 'POST',
    data
  });
};

const deleteItem = (resource, id) => request(`/${resource}/${encodeURIComponent(id)}`, {
  method: 'DELETE'
});

const uploadFile = async (path, field, file) => {
  const headers = {};
  const token = getAuthData()?.token;
  if (token) headers.Authorization = `Bearer ${token}`;
  const form = new FormData();
  form.append(field, file);
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: form });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'No se pudo subir el archivo.');
  if (result.url?.startsWith('/')) result.url = new URL(result.url, API_BASE_URL).toString();
  return result;
};

export const apiService = {
  login: async (email, password) => {
    const result = await request('/auth/login', {
      method: 'POST',
      data: { email, password },
      authenticated: false
    });
    authData = result;
    persistAuth();
    return result;
  },

  logout: async () => {
    authData = null;
    persistAuth();
  },

  getCurrentUser: () => getAuthData(),

  changePassword: async (currentPassword, newPassword, confirmPassword) => applyAuthResult(await request('/auth/change-password', {
    method: 'PUT',
    data: { currentPassword, newPassword, confirmPassword }
  })),

  updateCredentials: async (data) => applyAuthResult(await request('/auth/credentials', {
    method: 'PUT',
    data
  })),

  getAuditLogs: () => request('/audit-logs'),

  getUsers: () => request('/users'),
  saveUser: data => saveItem('users', data),
  deleteUser: id => deleteItem('users', id),

  getHero: () => request('/hero'),
  updateHero: data => request('/hero', { method: 'PUT', data }),
  uploadHeroVideo: file => uploadFile('/hero/upload-video', 'video', file),

  getAnuncios: () => request('/anuncios'),
  getPublicAnuncios: () => request('/anuncios/public', { authenticated: false }),
  saveAnuncio: data => saveItem('anuncios', data),
  deleteAnuncio: id => deleteItem('anuncios', id),
  toggleAnuncioStatus: id => request(`/anuncios/${encodeURIComponent(id)}/toggle`, { method: 'PATCH' }),
  uploadAnuncioImage: file => uploadFile('/anuncios/upload-image', 'image', file),

  getNoticias: async () => normalizeNews(await request('/noticias')),
  saveNoticia: async data => {
    const cleanLink = data.linkUrl || data.url || data.url_externa || '';
    const result = await saveItem('noticias', {
      ...data,
      title: data.title || data.titulo,
      summary: data.summary || data.extracto,
      content: data.content || data.contenido,
      category: data.category || data.categoria,
      img: data.image || data.img || data.imagen,
      image: data.image || data.img || data.imagen,
      date: data.date || data.fecha,
      linkUrl: cleanLink,
      url: cleanLink,
      url_externa: cleanLink
    });
    return normalizeNews(result);
  },
  deleteNoticia: async id => normalizeNews(await deleteItem('noticias', id)),
  syncFacebook: () => request('/facebook/sync', { method: 'POST' }),

  getProyectos: () => request('/proyectos'),
  saveProyecto: data => saveItem('proyectos', data),
  deleteProyecto: id => deleteItem('proyectos', id),

  getTurismo: () => request('/turismo'),
  saveTurismo: data => saveItem('turismo', data),
  deleteTurismo: id => deleteItem('turismo', id),

  getCultura: () => request('/cultura'),
  saveCultura: data => saveItem('cultura', data),
  deleteCultura: id => deleteItem('cultura', id),

  getStats: () => request('/stats'),
  saveStat: data => saveItem('stats', data),
  deleteStat: id => deleteItem('stats', id),

  getContacto: () => request('/contacto'),
  updateContacto: data => request('/contacto', { method: 'PUT', data }),

  getServiciosSettings: () => request('/servicios/settings'),
  saveServiciosSettings: data => request('/servicios/settings', { method: 'PUT', data }),
  getServicios: () => request('/servicios'),
  saveServicio: data => saveItem('servicios', data),
  deleteServicio: id => deleteItem('servicios', id),
  saveSubservicio: (categoriaId, data) => {
    const categoryPath = `/servicios/${encodeURIComponent(categoriaId)}/subservicios`;
    const path = data.id ? `${categoryPath}/${encodeURIComponent(data.id)}` : categoryPath;
    return request(path, { method: data.id ? 'PUT' : 'POST', data });
  },
  deleteSubservicio: (categoriaId, subservicioId) => request(
    `/servicios/${encodeURIComponent(categoriaId)}/subservicios/${encodeURIComponent(subservicioId)}`,
    { method: 'DELETE' }
  ),

  getCentrosAtencion: () => request('/cms/centros-atencion'),
  saveCentrosAtencion: data => request('/cms/centros-atencion', { method: 'PUT', data }),
  getRedesSociales: () => request('/cms/redes-sociales'),
  saveRedesSociales: data => request('/cms/redes-sociales', { method: 'PUT', data }),

  getGaleria: () => request('/galeria'),
  getPublicGaleria: () => request('/galeria/public', { authenticated: false }),
  saveGaleriaItem: data => saveItem('galeria', data),
  deleteGaleriaItem: id => deleteItem('galeria', id),
  toggleGaleriaStatus: id => request(`/galeria/${encodeURIComponent(id)}/toggle`, { method: 'PATCH' }),
  uploadGaleriaImage: file => uploadFile('/galeria/upload-image', 'image', file)
};
