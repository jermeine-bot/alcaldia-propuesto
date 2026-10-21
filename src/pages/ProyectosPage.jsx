import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchModal from '../components/SearchModal';
import ProyectoModal from '../components/ProyectoModal';
import { apiService } from '../services/apiService';
import {
  formatUrl,
  isExternalUrl,
  isProjectCompleted,
  isPublished,
  PROJECT_FALLBACK_IMAGE
} from '../utils/formatUrl';

const STATUS_FILTERS = ['Todos', 'En ejecución', 'Completados'];

const SORT_OPTIONS = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'avance-desc', label: 'Mayor avance' },
  { value: 'avance-asc', label: 'Menor avance' },
  { value: 'nombre', label: 'Nombre (A - Z)' }
];

const ProyectosPage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [sortBy, setSortBy] = useState('recientes');
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: proyectos = [], isLoading, isError, error } = useQuery({
    queryKey: ['proyectos'],
    queryFn: apiService.getProyectos
  });

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Proyectos y Obras Municipales | Alcaldía de León';
    window.scrollTo({ top: 0, behavior: 'auto' });
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const publishedProjects = useMemo(
    () => proyectos.filter(isPublished),
    [proyectos]
  );

  const categories = useMemo(() => {
    const values = publishedProjects
      .map((item) => (item.category || '').trim())
      .filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'es'));
  }, [publishedProjects]);

  const stats = useMemo(() => {
    const total = publishedProjects.length;
    const completed = publishedProjects.filter(isProjectCompleted).length;
    const progressSum = publishedProjects.reduce(
      (sum, item) => sum + Math.min(100, Math.max(0, Number(item.progress) || 0)),
      0
    );

    return {
      total,
      completed,
      inProgress: total - completed,
      averageProgress: total ? Math.round(progressSum / total) : 0,
      categories: categories.length
    };
  }, [publishedProjects, categories.length]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || statusFilter !== 'Todos' || categoryFilter !== 'Todas';

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const result = publishedProjects.filter((item) => {
      const completed = isProjectCompleted(item);
      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Completados' && completed) ||
        (statusFilter === 'En ejecución' && !completed);

      const matchesCategory =
        categoryFilter === 'Todas' || item.category === categoryFilter;

      const searchable = [
        item.title,
        item.desc,
        item.summary,
        item.detailed_desc,
        item.location,
        item.category,
        item.beneficiaries,
        item.cost
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && matchesCategory && (!term || searchable.includes(term));
    });

    return result.sort((a, b) => {
      if (sortBy === 'avance-desc') return (Number(b.progress) || 0) - (Number(a.progress) || 0);
      if (sortBy === 'avance-asc') return (Number(a.progress) || 0) - (Number(b.progress) || 0);
      if (sortBy === 'nombre') {
        return (a.title || '').localeCompare(b.title || '', 'es', { sensitivity: 'base' });
      }
      return 0;
    });
  }, [publishedProjects, searchTerm, statusFilter, categoryFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Todos');
    setCategoryFilter('Todas');
    setSortBy('recientes');
  };

  return (
    <div className="app-container proyectos-page">
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
              <span>Proyectos</span>
            </nav>

            <div className="row align-items-end g-4">
              <div className="col-lg-8">
                <span className="proyectos-page-eyebrow">Obras e inversión municipal</span>
                <h1 className="proyectos-page-title">
                  Proyectos que transforman <span>León</span>
                </h1>
                <p className="proyectos-page-lead">
                  Consulta el detalle de todas las obras impulsadas por la Alcaldía Municipal:
                  ubicación, inversión, avance físico, población beneficiada y estado de ejecución.
                </p>
                <div className="d-flex flex-wrap gap-3 pt-2">
                  <a href="#lista-proyectos" className="btn btn-danger rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2">
                    Explorar proyectos
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
                    <strong>Gobierno Municipal de León</strong>
                    <span>Transparencia en cada obra</span>
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
              <span className="proyectos-stat-icon bg-danger-subtle text-danger"><i className="fas fa-building"></i></span>
              <div>
                <strong>{stats.total}</strong>
                <span>Proyectos publicados</span>
              </div>
            </div>
            <div className="proyectos-stat">
              <span className="proyectos-stat-icon bg-warning-subtle text-warning"><i className="fas fa-hard-hat"></i></span>
              <div>
                <strong>{stats.inProgress}</strong>
                <span>En ejecución</span>
              </div>
            </div>
            <div className="proyectos-stat">
              <span className="proyectos-stat-icon bg-success-subtle text-success"><i className="fas fa-check-circle"></i></span>
              <div>
                <strong>{stats.completed}</strong>
                <span>Completados</span>
              </div>
            </div>
            <div className="proyectos-stat">
              <span className="proyectos-stat-icon bg-primary-subtle text-primary"><i className="fas fa-chart-line"></i></span>
              <div>
                <strong>{stats.averageProgress}%</strong>
                <span>Avance promedio</span>
              </div>
            </div>
          </div>
        </div>

        {/* LISTADO COMPLETO */}
        <section id="lista-proyectos" className="proyectos-page-list">
          <div className="container">
            <div className="proyectos-page-heading">
              <div>
                <span className="section-subtitle">Catálogo de obras</span>
                <h2 className="section-title mb-1">Todos los proyectos</h2>
                <p className="text-muted mb-0">
                  {stats.categories} {stats.categories === 1 ? 'categoría de proyecto' : 'categorías de proyecto'} · Información actualizada desde el CMS municipal.
                </p>
              </div>
              <Link to="/#proyectos" className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-none d-md-inline-flex align-items-center gap-2">
                <i className="fas fa-arrow-left small"></i>
                Ver sección en el inicio
              </Link>
            </div>

            {/* FILTROS Y BÚSQUEDA */}
            <div className="proyectos-page-toolbar">
              <div className="row g-3">
                <div className="col-12 col-lg-5">
                  <label htmlFor="proyectos-search" className="proyectos-filter-label">Buscar proyecto</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0"><i className="fas fa-search text-muted"></i></span>
                    <input
                      id="proyectos-search"
                      type="search"
                      className="form-control border-start-0 ps-0"
                      placeholder="Nombre, ubicación, categoría..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                </div>

                <div className="col-6 col-lg-3">
                  <label htmlFor="proyectos-category" className="proyectos-filter-label">Categoría</label>
                  <select
                    id="proyectos-category"
                    className="form-select"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                  >
                    <option value="Todas">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="col-6 col-lg-2">
                  <label htmlFor="proyectos-sort" className="proyectos-filter-label">Ordenar por</label>
                  <select
                    id="proyectos-sort"
                    className="form-select"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-lg-2 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters && sortBy === 'recientes'}
                  >
                    <i className="fas fa-eraser me-2"></i>Limpiar
                  </button>
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 pt-3 border-top">
                <div className="d-flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
                  {STATUS_FILTERS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 ${
                        statusFilter === status ? 'btn-danger' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <span className="text-muted small">
                  Mostrando <strong className="text-dark">{filteredProjects.length}</strong> de{' '}
                  <strong className="text-dark">{publishedProjects.length}</strong> proyectos
                </span>
              </div>
            </div>

            {/* RESULTADOS */}
            {isLoading ? (
              <div className="proyectos-page-empty">
                <div className="spinner-border text-danger mb-3" role="status"></div>
                <p className="text-muted mb-0">Cargando proyectos...</p>
              </div>
            ) : isError ? (
              <div className="proyectos-page-empty">
                <i className="fas fa-triangle-exclamation text-danger"></i>
                <h3>No se pudieron cargar los proyectos</h3>
                <p className="text-muted">{error?.message || 'Intenta recargar la página.'}</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="proyectos-page-empty">
                <i className="fas fa-search text-muted"></i>
                <h3>No encontramos proyectos con esos filtros</h3>
                <p className="text-muted">Prueba con otra búsqueda o restablece los filtros.</p>
                <button type="button" className="btn btn-danger rounded-pill px-4" onClick={clearFilters}>
                  Ver todos los proyectos
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredProjects.map((item, index) => {
                  const completed = isProjectCompleted(item);
                  const progress = Math.min(100, Math.max(0, Number(item.progress) || 0));
                  const targetUrl = formatUrl(item.linkUrl || item.url);
                  const external = isExternalUrl(targetUrl);
                  const startDate = item.startDate || item.start_date;

                  return (
                    <div className="col-12 col-lg-6" key={item.id}>
                      <article className="proyecto-page-card" style={{ '--project-delay': `${Math.min(index, 7) * 70}ms` }}>
                        <div className="proyecto-page-image">
                          <img
                            src={item.image || item.img || PROJECT_FALLBACK_IMAGE}
                            alt={item.title}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = PROJECT_FALLBACK_IMAGE;
                            }}
                          />
                          <div className="proyecto-page-image-top">
                            <span className="proyecto-page-category">{item.category || 'Proyecto'}</span>
                            <span className={`proyecto-page-status ${completed ? 'is-completed' : 'is-progress'}`}>
                              <i className={`fas ${completed ? 'fa-check-circle' : 'fa-spinner fa-spin'}`}></i>
                              {completed ? 'Completado' : 'En progreso'}
                            </span>
                          </div>
                          <div className="proyecto-page-progress-badge">{progress}%</div>
                        </div>

                        <div className="proyecto-page-body">
                          <div className="proyecto-page-kicker">
                            <span><i className="fas fa-calendar-alt"></i> {startDate || 'Fecha por definir'}</span>
                            <span><i className="fas fa-location-dot"></i> {item.location || 'León, Nicaragua'}</span>
                          </div>

                          <h3 className="proyecto-page-card-title">{item.title}</h3>
                          <p className="proyecto-page-card-desc">{item.desc || item.summary || 'Proyecto municipal de la Alcaldía de León.'}</p>

                          <div className="proyecto-page-facts">
                            <div className="proyecto-page-fact">
                              <i className="fas fa-coins text-warning"></i>
                              <div>
                                <span>Inversión estimada</span>
                                <strong>{item.cost || 'No especificada'}</strong>
                              </div>
                            </div>
                            <div className="proyecto-page-fact">
                              <i className="fas fa-user-friends text-success"></i>
                              <div>
                                <span>Población beneficiada</span>
                                <strong>{item.beneficiaries || 'No especificada'}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="proyecto-page-progress">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="small fw-semibold text-muted">Avance físico</span>
                              <strong className={completed ? 'text-success' : 'text-danger'}>{progress}%</strong>
                            </div>
                            <div className="progress rounded-pill" style={{ height: 9 }}>
                              <div
                                className={`progress-bar rounded-pill ${completed ? 'bg-success' : 'bg-danger'}`}
                                role="progressbar"
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="proyecto-page-actions">
                            <button
                              type="button"
                              className="btn btn-outline-danger rounded-pill px-3 fw-semibold"
                              onClick={() => setSelectedProject(item)}
                            >
                              <i className="fas fa-file-lines me-2"></i>Ficha completa
                            </button>
                            {targetUrl ? (
                              <a
                                href={targetUrl}
                                target={external ? '_blank' : '_self'}
                                rel={external ? 'noopener noreferrer' : undefined}
                                className="btn btn-danger rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-2"
                              >
                                Conocer más
                                <i className={`fas ${external ? 'fa-external-link-alt' : 'fa-arrow-right'} small`}></i>
                              </a>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-danger rounded-pill px-3 fw-semibold"
                                onClick={() => setSelectedProject(item)}
                              >
                                Conocer más
                                <i className="fas fa-arrow-right ms-2 small"></i>
                              </button>
                            )}
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
                <span className="section-subtitle text-white-50">Atención al ciudadano</span>
                <h2>¿Tienes preguntas sobre alguna obra?</h2>
                <p>
                  La Alcaldía de León pone a tu disposición los canales oficiales para consultar
                  el estado de los proyectos y presentar solicitudes ciudadanas.
                </p>
              </div>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/#contacto" className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-danger">
                  <i className="fas fa-envelope me-2"></i>Ir a contacto
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
      <ProyectoModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
};

export default ProyectosPage;
