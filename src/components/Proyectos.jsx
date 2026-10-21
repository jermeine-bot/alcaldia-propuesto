import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import ProyectoModal from './ProyectoModal';
import {
  formatUrl,
  isExternalUrl,
  isProjectCompleted,
  isPublished,
  PROJECT_FALLBACK_IMAGE
} from '../utils/formatUrl';

const HOME_LIMIT = 6;

const Proyectos = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: proyectos = [] } = useQuery({
    queryKey: ['proyectos'],
    queryFn: apiService.getProyectos
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const publishedProjects = useMemo(
    () => proyectos.filter(isPublished),
    [proyectos]
  );

  const categories = useMemo(() => {
    const values = publishedProjects
      .map((item) => (item.category || '').trim())
      .filter(Boolean);
    return [...new Set(values)];
  }, [publishedProjects]);

  const filters = useMemo(
    () => ['Todos', 'En Progreso', 'Completados', ...categories],
    [categories]
  );

  const filteredProyectos = useMemo(() => {
    return publishedProjects.filter((item) => {
      const completed = isProjectCompleted(item);
      if (activeFilter === 'Todos') return true;
      if (activeFilter === 'En Progreso') return !completed;
      if (activeFilter === 'Completados') return completed;
      return item.category === activeFilter;
    });
  }, [publishedProjects, activeFilter]);

  const visibleProjects = filteredProyectos.slice(0, HOME_LIMIT);
  const hasMoreProjects = publishedProjects.length > HOME_LIMIT;

  return (
    <section id="proyectos" ref={sectionRef} className="proyectos-section py-5 position-relative">
      <div className="container">
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Obras e Inversión Municipal</span>
          <h2 className="section-title">Proyectos de Transformación en León</h2>
          <p className="section-description">
            Obras estratégicas enfocadas en mejorar la infraestructura vial, espacios públicos,
            mercados y conservación patrimonial.
          </p>
        </div>

        {/* FILTROS INTERACTIVOS */}
        <div className="d-flex justify-content-center gap-2 mb-5 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`btn btn-sm rounded-pill px-4 transition-all ${
                activeFilter === filter ? 'btn-danger shadow-sm' : 'btn-outline-secondary'
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* LISTADO DE PROYECTOS (MÁXIMO 6 EN EL INICIO) */}
        <div className="row g-4">
          {visibleProjects.length === 0 ? (
            <div className="col-12 text-center text-muted py-4">
              No hay proyectos registrados para este filtro.
            </div>
          ) : (
            visibleProjects.map((item, idx) => {
              const isCompleted = isProjectCompleted(item);
              const targetUrl = formatUrl(item.linkUrl || item.url);
              const isExternal = isExternalUrl(targetUrl);

              return (
                <div key={item.id} className="col-lg-6">
                  <article
                    className={`proyecto-card shadow-sm ${isVisible ? 'proyecto-card-animated' : ''}`}
                    style={{ transitionDelay: `${idx * 120}ms` }}
                  >
                    <div className="proyecto-img-wrapper position-relative">
                      <img
                        src={item.image || item.img || PROJECT_FALLBACK_IMAGE}
                        alt={item.title}
                        className="proyecto-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PROJECT_FALLBACK_IMAGE;
                        }}
                      />
                      {item.category && (
                        <span className="proyecto-category-badge">{item.category}</span>
                      )}
                      {/* ETIQUETA CENTRADA */}
                      <div className="w-100 text-center position-absolute" style={{ bottom: '15px', left: 0, zIndex: 2 }}>
                        <span
                          className={`proyecto-status shadow-sm px-3 py-2 rounded-pill fw-bold ${
                            isCompleted ? 'bg-success text-white' : 'bg-danger text-white'
                          }`}
                          style={{ fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <i className={isCompleted ? 'fas fa-check-circle' : 'fas fa-spinner fa-spin'}></i>
                          {isCompleted ? 'COMPLETADO' : 'EN PROGRESO'}
                        </span>
                      </div>
                    </div>

                    <div className="proyecto-content">
                      <h4 className="fw-bold mb-2">{item.title}</h4>
                      <p className="text-muted small mb-3">{item.desc || item.summary}</p>

                      <div className="proyecto-meta d-flex justify-content-between text-muted small mb-3 flex-wrap gap-2">
                        <span><i className="fas fa-map-marker-alt text-danger me-1"></i> {item.location}</span>
                        <span><i className="fas fa-coins text-warning me-1"></i> {item.cost}</span>
                      </div>

                      {/* BARRA DE PROGRESO ANIMADA */}
                      <div className="proyecto-progress-wrapper mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small font-semibold">Progreso de Obra</span>
                          <span className="progress-label fw-bold text-danger">{item.progress}%</span>
                        </div>
                        <div className="progress rounded-pill style-progress">
                          <div
                            className={`progress-bar rounded-pill ${isCompleted ? 'bg-success' : 'bg-danger'}`}
                            style={{
                              width: isVisible ? `${item.progress}%` : '0%',
                              transition: `width 1.5s cubic-bezier(0.25, 1, 0.5, 1) ${idx * 150}ms`
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top flex-wrap gap-2">
                        <span className="text-muted small">
                          <i className="fas fa-users me-1 text-primary"></i> {item.beneficiaries}
                        </span>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                            onClick={() => setSelectedProject(item)}
                          >
                            <i className="fas fa-info-circle me-1"></i> Detalles
                          </button>
                          {targetUrl ? (
                            <a
                              href={targetUrl}
                              target={isExternal ? '_blank' : '_self'}
                              rel={isExternal ? 'noopener noreferrer' : undefined}
                              className="btn btn-danger btn-sm rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1"
                            >
                              Conocer más <i className="fas fa-external-link-alt ms-1 small"></i>
                            </a>
                          ) : (
                            <button
                              className="btn btn-danger btn-sm rounded-pill px-3 fw-semibold"
                              onClick={() => setSelectedProject(item)}
                            >
                              Conocer más
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })
          )}
        </div>

        {/* ACCESO A LA PÁGINA COMPLETA DE PROYECTOS */}
        {hasMoreProjects && (
          <div className="proyectos-home-footer text-center mt-5">
            <p className="text-muted small mb-3">
              {filteredProyectos.length > HOME_LIMIT
                ? `Mostrando ${HOME_LIMIT} de ${filteredProyectos.length} proyectos de este filtro.`
                : `Mostrando ${filteredProyectos.length} de ${publishedProjects.length} proyectos publicados.`}
            </p>
            <Link to="/proyectos" className="btn btn-danger rounded-pill px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-2">
              Ver todos los proyectos
              <span className="badge bg-white text-danger rounded-pill">{publishedProjects.length}</span>
              <i className="fas fa-arrow-right small"></i>
            </Link>
          </div>
        )}
      </div>

      <ProyectoModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  );
};

export default Proyectos;
