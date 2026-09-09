import {
  initialHeroData,
  initialNoticiasData,
  initialProyectosData,
  initialTurismoData,
  initialCulturaData,
  initialStatsData,
  initialContactoData
} from './initialData';

const KEYS = {
  HERO: 'alcaldia_leon_hero',
  NOTICIAS: 'alcaldia_leon_noticias',
  PROYECTOS: 'alcaldia_leon_proyectos',
  TURISMO: 'alcaldia_leon_turismo',
  CULTURA: 'alcaldia_leon_cultura',
  STATS: 'alcaldia_leon_stats',
  CONTACTO: 'alcaldia_leon_contacto',
  AUTH: 'alcaldia_leon_auth'
};

// Helper para inicializar localStorage si está vacío
const initStorage = () => {
  if (!localStorage.getItem(KEYS.HERO)) {
    localStorage.setItem(KEYS.HERO, JSON.stringify(initialHeroData));
  }
  if (!localStorage.getItem(KEYS.NOTICIAS)) {
    localStorage.setItem(KEYS.NOTICIAS, JSON.stringify(initialNoticiasData));
  }
  if (!localStorage.getItem(KEYS.PROYECTOS)) {
    localStorage.setItem(KEYS.PROYECTOS, JSON.stringify(initialProyectosData));
  }
  if (!localStorage.getItem(KEYS.TURISMO)) {
    localStorage.setItem(KEYS.TURISMO, JSON.stringify(initialTurismoData));
  }
  if (!localStorage.getItem(KEYS.CULTURA)) {
    localStorage.setItem(KEYS.CULTURA, JSON.stringify(initialCulturaData));
  }
  if (!localStorage.getItem(KEYS.STATS)) {
    localStorage.setItem(KEYS.STATS, JSON.stringify(initialStatsData));
  }
  if (!localStorage.getItem(KEYS.CONTACTO)) {
    localStorage.setItem(KEYS.CONTACTO, JSON.stringify(initialContactoData));
  }
};

// Simula delay de red asíncrono
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

initStorage();

export const mockStorage = {
  // Autenticación simulada
  login: async (email, password) => {
    await delay(400);
    if (email === 'admin@alcaldaleon.gob.ni' && password === 'admin123') {
      const user = {
        id: 'u-1',
        name: 'Administrador General',
        email: 'admin@alcaldaleon.gob.ni',
        role: 'superadmin',
        avatar: '/img/nav_logo/logo nav2.png'
      };
      const token = 'jwt_mock_token_alcaldia_leon_2026';
      localStorage.setItem(KEYS.AUTH, JSON.stringify({ user, token }));
      return { user, token };
    }
    throw new Error('Credenciales inválidas. Verifica tu correo o contraseña.');
  },

  logout: async () => {
    await delay(100);
    localStorage.removeItem(KEYS.AUTH);
  },

  getCurrentUser: () => {
    const authData = localStorage.getItem(KEYS.AUTH);
    return authData ? JSON.parse(authData) : null;
  },

  // HERO / PORTADA
  getHero: async () => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.HERO)) || initialHeroData;
  },
  updateHero: async (data) => {
    await delay();
    const updated = { ...data, id: 'hero-1', updated_at: new Date().toISOString() };
    localStorage.setItem(KEYS.HERO, JSON.stringify(updated));
    return updated;
  },

  // NOTICIAS
  getNoticias: async () => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.NOTICIAS)) || initialNoticiasData;
  },
  saveNoticia: async (noticia) => {
    await delay();
    const items = JSON.parse(localStorage.getItem(KEYS.NOTICIAS)) || initialNoticiasData;
    if (noticia.id) {
      const index = items.findIndex((i) => i.id === noticia.id);
      if (index !== -1) {
        items[index] = { ...items[index], ...noticia, updated_at: new Date().toISOString() };
      }
    } else {
      const newItem = {
        ...noticia,
        id: `noticia-${Date.now()}`,
        status: noticia.status || 'published',
        date: noticia.date || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        created_at: new Date().toISOString()
      };
      items.unshift(newItem);
    }
    localStorage.setItem(KEYS.NOTICIAS, JSON.stringify(items));
    return items;
  },
  deleteNoticia: async (id) => {
    await delay();
    let items = JSON.parse(localStorage.getItem(KEYS.NOTICIAS)) || initialNoticiasData;
    items = items.filter((i) => i.id !== id);
    localStorage.setItem(KEYS.NOTICIAS, JSON.stringify(items));
    return items;
  },

  // PROYECTOS
  getProyectos: async () => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.PROYECTOS)) || initialProyectosData;
  },
  saveProyecto: async (proyecto) => {
    await delay();
    const items = JSON.parse(localStorage.getItem(KEYS.PROYECTOS)) || initialProyectosData;
    const isCompleted = Number(proyecto.progress) === 100;
    const statusText = isCompleted ? 'Completado' : 'En Progreso';

    if (proyecto.id) {
      const index = items.findIndex((i) => i.id === proyecto.id);
      if (index !== -1) {
        items[index] = {
          ...items[index],
          ...proyecto,
          isCompleted,
          status: statusText,
          updated_at: new Date().toISOString()
        };
      }
    } else {
      const newItem = {
        ...proyecto,
        id: `proyecto-${Date.now()}`,
        isCompleted,
        status: statusText,
        created_at: new Date().toISOString()
      };
      items.unshift(newItem);
    }
    localStorage.setItem(KEYS.PROYECTOS, JSON.stringify(items));
    return items;
  },
  deleteProyecto: async (id) => {
    await delay();
    let items = JSON.parse(localStorage.getItem(KEYS.PROYECTOS)) || initialProyectosData;
    items = items.filter((i) => i.id !== id);
    localStorage.setItem(KEYS.PROYECTOS, JSON.stringify(items));
    return items;
  },

  // TURISMO
  getTurismo: async () => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.TURISMO)) || initialTurismoData;
  },
  saveTurismo: async (lugar) => {
    await delay();
    const items = JSON.parse(localStorage.getItem(KEYS.TURISMO)) || initialTurismoData;
    if (lugar.id) {
      const index = items.findIndex((i) => i.id === lugar.id);
      if (index !== -1) {
        items[index] = { ...items[index], ...lugar, updated_at: new Date().toISOString() };
      }
    } else {
      const newItem = {
        ...lugar,
        id: `turismo-${Date.now()}`,
        is_published: lugar.is_published ?? true,
        created_at: new Date().toISOString()
      };
      items.push(newItem);
    }
    localStorage.setItem(KEYS.TURISMO, JSON.stringify(items));
    return items;
  },
  deleteTurismo: async (id) => {
    await delay();
    let items = JSON.parse(localStorage.getItem(KEYS.TURISMO)) || initialTurismoData;
    items = items.filter((i) => i.id !== id);
    localStorage.setItem(KEYS.TURISMO, JSON.stringify(items));
    return items;
  },

  // AGENDA CULTURAL
  getCultura: async () => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.CULTURA)) || initialCulturaData;
  },
  saveCultura: async (evento) => {
    await delay();
    const items = JSON.parse(localStorage.getItem(KEYS.CULTURA)) || initialCulturaData;
    if (evento.id) {
      const index = items.findIndex((i) => i.id === evento.id);
      if (index !== -1) {
        items[index] = { ...items[index], ...evento, updated_at: new Date().toISOString() };
      }
    } else {
      const newItem = {
        ...evento,
        id: `cultura-${Date.now()}`,
        is_published: evento.is_published ?? true,
        created_at: new Date().toISOString()
      };
      items.push(newItem);
    }
    localStorage.setItem(KEYS.CULTURA, JSON.stringify(items));
    return items;
  },
  deleteCultura: async (id) => {
    await delay();
    let items = JSON.parse(localStorage.getItem(KEYS.CULTURA)) || initialCulturaData;
    items = items.filter((i) => i.id !== id);
    localStorage.setItem(KEYS.CULTURA, JSON.stringify(items));
    return items;
  },

  // ESTADÍSTICAS
  getStats: async () => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.STATS)) || initialStatsData;
  },
  saveStat: async (stat) => {
    await delay();
    const items = JSON.parse(localStorage.getItem(KEYS.STATS)) || initialStatsData;
    if (stat.id) {
      const index = items.findIndex((i) => i.id === stat.id);
      if (index !== -1) {
        items[index] = { ...items[index], ...stat, updated_at: new Date().toISOString() };
      }
    } else {
      const newItem = {
        ...stat,
        id: `stat-${Date.now()}`,
        is_published: stat.is_published ?? true,
        created_at: new Date().toISOString()
      };
      items.push(newItem);
    }
    localStorage.setItem(KEYS.STATS, JSON.stringify(items));
    return items;
  },
  deleteStat: async (id) => {
    await delay();
    let items = JSON.parse(localStorage.getItem(KEYS.STATS)) || initialStatsData;
    items = items.filter((i) => i.id !== id);
    localStorage.setItem(KEYS.STATS, JSON.stringify(items));
    return items;
  },

  // CONTACTO
  getContacto: async () => {
    await delay();
    return JSON.parse(localStorage.getItem(KEYS.CONTACTO)) || initialContactoData;
  },
  updateContacto: async (data) => {
    await delay();
    const updated = { ...data, id: 'contacto-1', updated_at: new Date().toISOString() };
    localStorage.setItem(KEYS.CONTACTO, JSON.stringify(updated));
    return updated;
  },

  // Restablecer almacenamiento a datos por defecto
  resetToDefault: async () => {
    localStorage.setItem(KEYS.HERO, JSON.stringify(initialHeroData));
    localStorage.setItem(KEYS.NOTICIAS, JSON.stringify(initialNoticiasData));
    localStorage.setItem(KEYS.PROYECTOS, JSON.stringify(initialProyectosData));
    localStorage.setItem(KEYS.TURISMO, JSON.stringify(initialTurismoData));
    localStorage.setItem(KEYS.CULTURA, JSON.stringify(initialCulturaData));
    localStorage.setItem(KEYS.STATS, JSON.stringify(initialStatsData));
    localStorage.setItem(KEYS.CONTACTO, JSON.stringify(initialContactoData));
    return true;
  }
};
