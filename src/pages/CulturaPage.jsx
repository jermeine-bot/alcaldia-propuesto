import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchModal from '../components/SearchModal';
import { apiService } from '../services/apiService';

const FALLBACK_IMAGE = '/img/noticias/festival de la poseia.jpg';

const SORT_OPTIONS = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'nombre', label: 'Nombre (A - Z)' }
];

const CulturaPage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [sortBy, setSortBy] = useState('recientes');
  const [selectedCultura, setSelectedCultura] = useState(null);

  const { data: cultura = [], isLoading, isError, error } = useQuery({
    queryKey: ['cultura'],
    queryFn: apiService.getCultura
  });

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Efemérides, Cultura y Tradiciones | Alcaldía de León';
    window.scrollTo({ top: 0, behavior: 'auto' });
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const categories = useMemo(() => {
    const values = cultura
      .map((item) => (item.category || item.tag || '').trim())
      .filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'es'));
  }, [cultura]);

  const stats = useMemo(() => {
    const total = cultura.length;
    return {
      total,
      categories: categories.length
    };
  }, [cultura, categories.length]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || categoryFilter !== 'Todas';

  const filteredCultura = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const result = cultura.filter((item) => {
      const itemCategory = (item.category || item.tag || '').trim();
      const matchesCategory =
        categoryFilter === 'Todas' || itemCategory === categoryFilter;

      const searchable = [
        item.title,
        item.desc,
        item.summary,
        item.content,
        item.location,
        item.event_date,
        itemCategory
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesCategory && (!term || searchable.includes(term));
    });

    return result.sort((a, b) => {
      if (sortBy === 'nombre') {
        return (a.title || '').localeCompare(b.title || '', 'es', { sensitivity: 'base' });
      }
      return 0; // Orden por defecto / recientes según llegada del CMS
    });
  }, [cultura, searchTerm, categoryFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('Todas');
    setSortBy('recientes');
  };

  return (
    <div className="app-container cultura-page">
      <Header onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main>
        {/* PORTADA DE LA PÁGINA */}
        <section className="proyectos-page-hero">
          <div className="proyectos-page-hero-overlay"></div>
          <div className="container position-relative">
            <nav className="proyectos-breadcrumb" aria-label="Ruta de navegación">
              <Link to="/"><i className="fas fa-home me-2"></i>Inicio</Link>
              <i className="fas fa-chevron-right mx-2 small"></i>
              <span>Cultura y Efemérides</span>
            </nav>

            <div className="row align-items-end g-4">
              <div className="col-lg-8">
                <span className="proyectos-page-eyebrow">Tradición e Historia</span>
                <h1 className="proyectos-page-title">
                  Efemérides y Festividades de <span>León</span>
                </h1>
                <p className="proyectos-page-lead">
                  Revive la memoria histórica, fechas memorables, celebraciones patronales
                  y eventos culturales que enorgullecen al pueblo leonés.
                </p>
                <div className="d-flex flex-wrap gap-3 pt-2">
                  <a href="#lista-cultura" className="btn btn-danger rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2">
                    Explorar eventos
                    <i className="fas fa-arrow-down small"></i>
                  </a>
                  <Link to="/#contacto" className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold">
                    Contactar a la Alcaldía
                  </Link>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="proyectos-page-hero-note">
                  <i className="fas fa-landmark"></i>
                  <div>
                    <strong>Patrimonio Cultural</strong>
                    <span>Historia viva de Nicaragua</span>
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
              <span className="proyectos-stat-icon bg-danger-subtle text-danger"><i className="fas fa-calendar-star"></i></span>
              <div>
                <strong>{stats.total}</strong>
                <span>Registros históricos y festivos</span>
              </div>
            </div>
            <div className="proyectos-stat">
              <span className="proyectos-stat-icon bg-warning-subtle text-warning"><i className="fas fa-tags"></i></span>
              <div>
                <strong>{stats.categories}</strong>
                <span>Categorías de efemérides</span>
              </div>
            </div>
            <div className="proyectos-stat">
              <span className="proyectos-stat-icon bg-success-subtle text-success"><i className="fas fa-city"></i></span>
              <div>
                <strong>León, 1524</strong>
                <span>Ciudad Universitaria y Colonial</span>
              </div>
            </div>
            <div className="proyectos-stat">
              <span className="proyectos-stat-icon bg-primary-subtle text-primary"><i className="fas fa-book-open"></i></span>
              <div>
                <strong>CMS Municipal</strong>
                <span>Actualizado en tiempo real</span>
              </div>
            </div>
          </div>
        </div>

        {/* LISTADO COMPLETO */}
        <section id="lista-cultura" className="proyectos-page-list">
          <div className="container">
            <div className="proyectos-page-heading">
              <div>
                <span className="section-subtitle">Calendario e Historia</span>
                <h2 className="section-title mb-1">Efemérides y Tradiciones</h2>
                <p className="text-muted mb-0">
                  Gestión completa de fechas conmemorativas, ferias y festividades desde el CMS.
                </p>
              </div>
              <Link to="/#cultura" className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-none d-md-inline-flex align-items-center gap-2">
                <i className="fas fa-arrow-left small"></i>
                Ver sección en el inicio
              </Link>
            </div>

            {/* FILTROS Y BÚSQUEDA */}
            <div className="proyectos-page-toolbar">
              <div className="row g-3">
                <div className="col-12 col-lg-6">
                  <label htmlFor="cultura-search" className="proyectos-filter-label">Buscar efeméride o evento</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0"><i className="fas fa-search text-muted"></i></span>
                    <input
                      id="cultura-search"
                      type="search"
                      className="form-control border-start-0 ps-0"
                      placeholder="Nombre, fecha, descripción, lugar..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                </div>

                <div className="col-6 col-lg-4">
                  <label htmlFor="cultura-category" className="proyectos-filter-label">Categoría / Tipo</label>
                  <select
                    id="cultura-category"
                    className="form-select"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                  >
                    <option value="Todas">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="col-6 col-lg-2 d-flex align-items-end">
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
                  Mostrando <strong className="text-dark">{filteredCultura.length}</strong> de{' '}
                  <strong className="text-dark">{cultura.length}</strong> efemérides y eventos
                </span>
              </div>
            </div>

            {/* RESULTADOS */}
            {isLoading ? (
              <div className="proyectos-page-empty">
                <div className="spinner-border text-danger mb-3" role="status"></div>
                <p className="text-muted mb-0">Cargando efemérides y eventos...</p>
              </div>
            ) : isError ? (
              <div className="proyectos-page-empty">
                <i className="fas fa-triangle-exclamation text-danger"></i>
                <h3>No se pudieron cargar los datos</h3>
                <p className="text-muted">{error?.message || 'Intenta recargar la página.'}</p>
              </div>
            ) : filteredCultura.length === 0 ? (
              <div className="proyectos-page-empty">
                <i className="fas fa-search text-muted"></i>
                <h3>No encontramos efemérides con esos filtros</h3>
                <p className="text-muted">Prueba con otra búsqueda o restablece los filtros.</p>
                <button type="button" className="btn btn-danger rounded-pill px-4" onClick={clearFilters}>
                  Ver todas las efemérides
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredCultura.map((item, index) => {
                  const image = item.image_url || item.image || item.img || FALLBACK_IMAGE;
                  const itemCategory = item.category || item.tag || 'Cultura';

                  return (
                    <div className="col-12 col-md-6 col-lg-4" key={item.id}>
                      <article className="proyecto-page-card h-100 d-flex flex-column" style={{ '--project-delay': `${Math.min(index, 7) * 70}ms` }}>
                        <div className="proyecto-page-image" style={{ height: '220px' }}>
                          <img
                            src={image}
                            alt={item.title || 'Efeméride cultural'}
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
                            {item.event_date && (
                              <span><i className="far fa-calendar-alt text-danger me-1"></i> {item.event_date}</span>
                            )}
                            {item.location && (
                              <span><i className="fas fa-map-marker-alt text-danger me-1"></i> {item.location}</span>
                            )}
                          </div>

                          <h3 className="proyecto-page-card-title h5 mb-2">{item.title}</h3>
                          <p className="proyecto-page-card-desc small text-muted mb-3 flex-grow-1">
                            {item.desc || item.summary || item.content || 'Efeméride y tradición histórica de León.'}
                          </p>

                          {item.event_time && (
                            <div className="small text-muted mb-3">
                              <i className="far fa-clock me-1 text-warning"></i> <strong>Hora:</strong> {item.event_time}
                            </div>
                          )}

                          <div className="proyecto-page-actions pt-2 border-top mt-auto">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold w-100"
                              onClick={() => setSelectedCultura(item)}
                            >
                              <i className="fas fa-book-open me-2"></i>Leer reseña completa
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

        {/* LLAMADO A CONTACTO */}
        <section className="proyectos-page-contact">
          <div className="container">
            <div className="proyectos-page-contact-inner">
              <div>
                <span className="section-subtitle text-white-50">Cultura y Tradición</span>
                <h2>¿Conoces alguna fecha histórica importante?</h2>
                <p>
                  La Alcaldía de León valora el aporte ciudadano para enriquecer nuestro archivo de efemérides municipales.
                </p>
              </div>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/#contacto" className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-danger">
                  <i className="fas fa-envelope me-2"></i>Sugerir efeméride
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

      {/* MODAL DE DETALLE PARA EFEMÉRIDES / CULTURA */}
      {selectedCultura && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setSelectedCultura(null)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-landmark me-2"></i>{selectedCultura.title}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedCultura(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <img
                    src={selectedCultura.image_url || selectedCultura.image || selectedCultura.img || FALLBACK_IMAGE}
                    alt={selectedCultura.title}
                    className="img-fluid rounded-3 shadow-sm"
                    style={{ maxHeight: '320px', width: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                {selectedCultura.event_date && (
                  <p className="text-danger fw-semibold mb-2">
                    <i className="far fa-calendar-alt me-2"></i>Fecha conmemorativa: {selectedCultura.event_date}
                  </p>
                )}
                {selectedCultura.location && (
                  <p className="text-muted small mb-2">
                    <i className="fas fa-map-marker-alt me-2 text-danger"></i>Ubicación: {selectedCultura.location}
                  </p>
                )}
                <h6 className="fw-bold mt-3 text-dark">Reseña histórica / Descripción</h6>
                <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                  {selectedCultura.content || selectedCultura.desc || selectedCultura.summary}
                </p>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedCultura(null)}>
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

export default CulturaPage;