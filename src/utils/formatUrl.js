/**
 * Normaliza una URL para usarla en enlaces del sitio.
 * - Respeta rutas internas, anclas y URLs absolutas.
 * - Agrega https:// a dominios escritos sin protocolo.
 */
export const formatUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const isExternalUrl = (url) => /^https?:\/\//i.test(url || '');

/**
 * Los datos pueden venir de MySQL como booleanos, 0/1 o "0"/"1".
 */
export const isPublished = (item) => {
  const value = item?.is_published ?? item?.published ?? true;
  return !(value === false || value === 0 || value === '0' || value === 'false');
};

export const isProjectCompleted = (project) => {
  if (!project) return false;
  if (project.isCompleted === true || project.isCompleted === 1 || project.isCompleted === '1') return true;
  return Number(project.progress) >= 100;
};

export const PROJECT_FALLBACK_IMAGE = '/img/proyectos/proyecto1.jpg';
