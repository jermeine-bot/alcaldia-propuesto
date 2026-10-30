import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchModal from '../components/SearchModal';
import { apiService } from '../services/apiService';

const FALLBACK_IMAGE = '/img/noticias/default-news.jpg';

const SORT_OPTIONS = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'nombre', label: 'Título (A - Z)' }
];

const NoticiasPage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [sortBy, setSortBy] = useState('recientes');
  const [selectedNoticia, setSelectedNoticia] = useState(null);

  // Consulta al CMS a través del apiService
  const { data: noticias = [], isLoading, isError, error } = useQuery({
    queryKey: ['noticias'],
    queryFn: apiService.getNoticias || apiService.getNews
  });

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Noticias y Actualidad | Alcaldía de León';
    window.scrollTo({ top: 0, behavior: 'auto' });
    return () => {
      document.title = previousTitle;
    };
  }, []);

  // Extraer categorías dinámicamente desde los items del CMS
  const categories = useMemo(() => {
    const values = noticias
      .map((item) => (item.category || item.categoria || item.tag || '').trim())
      .filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'es'));
  }, [noticias]);

  // Estadísticas para el encabezado
  const stats = useMemo(() => {
    return {
      total: noticias.length,
      categories: categories.length
    };
  }, [noticias, categories.length]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || categoryFilter !== 'Todas' || sortBy !== 'recientes';

  // Filtrado y ordenamiento de noticias
  const filteredNoticias = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const result = noticias.filter((item) => {
      const itemCategory = (item.category || item.categoria || item.tag || '').trim();
      const matchesCategory =
        categoryFilter === 'Todas' || itemCategory === categoryFilter;

      const searchable = [
        item.title,
        item.titulo,
        item.desc,
        item.summary,
        item.resumen,
        item.content,
        item.contenido,
        item.author,
        item.autor,
        item.published_at,
        item.date,
        itemCategory
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesCategory && (!term || searchable.includes(term));
    });

    return result.sort((a, b) => {
      if (sortBy === 'nombre') {
        const titleA = a.title || a.titulo || '';
        const titleB = b.title || b.titulo || '';
        return titleA.localeCompare(titleB, 'es', { sensitivity: 'base' });
      }
      // Orden por defecto: Más recientes (se asume orden predeterminado del CMS o por fecha si existe)
      const dateA = new Date(a.published_at || a.date || a.createdAt || 0);
      const dateB = new Date(b.published_at || b.date || b.createdAt || 0);
      return dateB - dateA;
    });
  }, [noticias, searchTerm, categoryFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('Todas');
    setSortBy('recientes');
  };

  return (
    <div className="app-container noticias-page">
      <Header onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main>
        {/* PORTADA / HERO DE NOTICIAS */}
        <section className="proyectos-page-hero">
          <div className="proyectos-page-hero-overlay"></div>
          <div className="container position-relative">
            <nav className="proyectos-breadcrumb" aria-label="Ruta de navegación">
              <Link to="/"><i className="fas fa-home me-2"></i>Inicio</Link>
              <i className="fas fa-chevron-right mx-2 small"></i>
              <span>Noticias y Actualidad</span>
            </nav>

            <div className="row align-items-end g-4">
              <div className="col-lg-8">
                <span className="proyectos-page-eyebrow">Información Municipal</span>
                <h1 className="proyectos-page-title">
                  Noticias y Novedades de <span>León</span>
                </h1>
                <p className="proyectos-page-lead">
                  Mantente informado sobre la gestión municipal, obras, comunicados oficiales
                  y los acontecimientos más relevantes de la Ciudad Universitaria.
                </p>
                <div className="d-flex flex-wrap gap-3 pt-2">
                  <a href="#lista-noticias" className="btn btn-danger rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2">
                    Ver noticias
                    <i className="fas fa-arrow-down small"></i>
                  </a>
                 
                </div>
              </div>
              <div className="col-lg-4">
                <div className="proyectos-page-hero-note">
                  <i className="fas fa-newspaper"></i>
                  <div>
                    <strong>Prensa Oficial</strong>
                    <span>Actualización constante</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INDICADORES GENERALES */}
        <div className="container proyectos-page-stats-wrap">
          <div className="proyectos-page-stats">
            <div className="proyectos-stat">
              <span className="proyectos-stat-icon bg-danger-subtle text-danger"><i className="fas fa-newspaper"></i></span>
              <div>
                <strong>{stats.total}</strong>
                <span>Publicaciones registradas</span>
              </div>
            </div>
            <div className="proyectos-stat">
              <span className="proyectos-stat-icon bg-warning-subtle text-warning"><i className="fas fa-tags"></i></span>
              <div>
                <strong>{stats.categories}</strong>
                <span>Categorías de noticias</span>
              </div>
            </div>
            <div className="proyectos-stat">
              <span className="proyectos-stat-icon bg-success-subtle text-success"><i className="fas fa-city"></i></span>
              <div>
                <strong>Alcaldía de León</strong>
                <span>Transparencia y Gestión</span>
              </div>
            </div>
            <div className="proyectos-stat">
              <span className="proyectos-stat-icon bg-primary-subtle text-primary"><i className="fas fa-rss"></i></span>
              <div>
                <strong>CMS Municipal</strong>
                <span>En vivo en el portal</span>
              </div>
            </div>
          </div>
        </div>

        {/* LISTADO COMPLETO DE NOTICIAS */}
        <section id="lista-noticias" className="proyectos-page-list">
          <div className="container">
            <div className="proyectos-page-heading">
              <div>
                <span className="section-subtitle">Actualidad Municipal</span>
                <h2 className="section-title mb-1">Últimas Noticias</h2>
                <p className="text-muted mb-0">
                  Consulta el boletín de noticias, anuncios y comunicados actualizados desde el CMS.
                </p>
              </div>
              <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-none d-md-inline-flex align-items-center gap-2">
                <i className="fas fa-arrow-left small"></i>
                Ver inicio
              </Link>
            </div>

            {/* FILTROS Y BÚSQUEDA */}
            <div className="proyectos-page-toolbar">
              <div className="row g-3">
                <div className="col-12 col-lg-5">
                  <label htmlFor="noticia-search" className="proyectos-filter-label">Buscar noticia</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0"><i className="fas fa-search text-muted"></i></span>
                    <input
                      id="noticia-search"
                      type="search"
                      className="form-control border-start-0 ps-0"
                      placeholder="Título, palabra clave, contenido..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-6 col-lg-3">
                  <label htmlFor="noticia-category" className="proyectos-filter-label">Categoría</label>
                  <select
                    id="noticia-category"
                    className="form-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="Todas">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="col-6 col-lg-2">
                  <label htmlFor="noticia-sort" className="proyectos-filter-label">Ordenar por</label>
                  <select
                    id="noticia-sort"
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-lg-2 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                  >
                    <i className="fas fa-eraser me-2"></i>Limpiar
                  </button>
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 pt-3 border-top">
                <span className="text-muted small">
                  Mostrando <strong className="text-dark">{filteredNoticias.length}</strong> de{' '}
                  <strong className="text-dark">{noticias.length}</strong> noticias
                </span>
              </div>
            </div>

            {/* RESULTADOS */}
            {isLoading ? (
              <div className="proyectos-page-empty">
                <div className="spinner-border text-danger mb-3" role="status"></div>
                <p className="text-muted mb-0">Cargando noticias desde el CMS...</p>
              </div>
            ) : isError ? (
              <div className="proyectos-page-empty">
                <i className="fas fa-triangle-exclamation text-danger"></i>
                <h3>No se pudieron cargar las noticias</h3>
                <p className="text-muted">{error?.message || 'Intenta recargar la página más tarde.'}</p>
              </div>
            ) : filteredNoticias.length === 0 ? (
              <div className="proyectos-page-empty">
                <i className="fas fa-search text-muted"></i>
                <h3>No se encontraron noticias</h3>
                <p className="text-muted">Prueba cambiando el término de búsqueda o seleccionando otra categoría.</p>
                <button type="button" className="btn btn-danger rounded-pill px-4" onClick={clearFilters}>
                  Ver todas las noticias
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredNoticias.map((item, index) => {
                  const image = item.image_url || item.image || item.img || FALLBACK_IMAGE;
                  const itemCategory = item.category || item.categoria || item.tag || 'Noticia';
                  const title = item.title || item.titulo || 'Sin título';
                  const date = item.published_at || item.date || item.fecha || null;
                  const author = item.author || item.autor || null;
                  const excerpt = item.summary || item.resumen || item.desc || item.content || item.contenido || '';

                  return (
                    <div className="col-12 col-md-6 col-lg-4" key={item.id || index}>
                      <article className="proyecto-page-card h-100 d-flex flex-column" style={{ '--project-delay': `${Math.min(index, 7) * 70}ms` }}>
                        <div className="proyecto-page-image" style={{ height: '220px' }}>
                          <img
                            src={image}
                            alt={title}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = FALLBACK_IMAGE;
                            }}
                          />
                          <div className="proyecto-page-image-top">
                            <span className="proyecto-page-category">{itemCategory}</span>
                          </div>
                        </div>

                        <div className="proyecto-page-body d-flex flex-column flex-grow-1">
                          <div className="proyecto-page-kicker mb-2">
                            {date && (
                              <span><i className="far fa-calendar-alt text-danger me-1"></i> {date}</span>
                            )}
                            {author && (
                              <span><i className="far fa-user text-danger me-1"></i> {author}</span>
                            )}
                          </div>

                          <h3 className="proyecto-page-card-title h5 mb-2">{title}</h3>
                          <p className="proyecto-page-card-desc small text-muted mb-3 flex-grow-1">
                            {excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt}
                          </p>

                          <div className="proyecto-page-actions pt-2 border-top mt-auto">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold w-100"
                              onClick={() => setSelectedNoticia(item)}
                            >
                              <i className="fas fa-newspaper me-2"></i>Leer noticia completa
                            </button>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* LLAMADO A CONTACTO / SUSCRIPCIÓN */}
        <section className="proyectos-page-contact">
          <div className="container">
            <div className="proyectos-page-contact-inner">
              <div>
                <span className="section-subtitle text-white-50">Oficina de Comunicación</span>
                <h2>¿Tienes alguna duda o reporte de prensa?</h2>
                <p>
                  Ponte en contacto con la oficina de relaciones públicas y comunicación de la Alcaldía de León.
                </p>
              </div>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/#contacto" className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-danger">
                  <i className="fas fa-envelope me-2"></i>Enviar consulta
                </Link>
                <Link to="/" className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold">
                  <i className="fas fa-arrow-left me-2"></i>Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* MODAL PARA DETALLE DE NOTICIA COMPLETA */}
      {selectedNoticia && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setSelectedNoticia(null)}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-newspaper me-2"></i>
                  {selectedNoticia.title || selectedNoticia.titulo}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedNoticia(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <img
                    src={selectedNoticia.image_url || selectedNoticia.image || selectedNoticia.img || FALLBACK_IMAGE}
                    alt={selectedNoticia.title || selectedNoticia.titulo}
                    className="img-fluid rounded-3 shadow-sm"
                    style={{ maxHeight: '350px', width: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>

                <div className="d-flex flex-wrap gap-3 mb-3 text-muted small border-bottom pb-2">
                  {(selectedNoticia.published_at || selectedNoticia.date || selectedNoticia.fecha) && (
                    <span>
                      <i className="far fa-calendar-alt text-danger me-1"></i>
                      <strong>Fecha:</strong> {selectedNoticia.published_at || selectedNoticia.date || selectedNoticia.fecha}
                    </span>
                  )}
                  {(selectedNoticia.author || selectedNoticia.autor) && (
                    <span>
                      <i className="far fa-user text-danger me-1"></i>
                      <strong>Por:</strong> {selectedNoticia.author || selectedNoticia.autor}
                    </span>
                  )}
                  {(selectedNoticia.category || selectedNoticia.categoria) && (
                    <span className="badge bg-danger-subtle text-danger">
                      {selectedNoticia.category || selectedNoticia.categoria}
                    </span>
                  )}
                </div>

                <div className="noticia-contenido text-dark lh-base" style={{ whiteSpace: 'pre-line' }}>
                  {selectedNoticia.content || selectedNoticia.contenido || selectedNoticia.summary || selectedNoticia.resumen || selectedNoticia.desc}
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedNoticia(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticiasPage;