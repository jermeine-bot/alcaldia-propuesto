import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

const AnimatedValue = ({ target, suffix = '', isVisible = false }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    const duration = 2400;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(Math.floor(ease * (target || 0)));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [target, isVisible]);

  return (
    <span>
      {(val || 0).toLocaleString()}
      {suffix}
    </span>
  );
};

const Estadisticas = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedStat, setSelectedStat] = useState(null);

  const { data: cityStats = [] } = useQuery({
    queryKey: ['stats'],
    queryFn: apiService.getStats
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

  // Bloquear el scroll del body cuando el modal esté abierto
  useEffect(() => {
    if (selectedStat) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedStat(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedStat]);

  const categories = ['Todos', 'Población', 'Desarrollo', 'Cultura', 'Servicios', 'Geografía', 'Turismo'];

  const filteredStats = activeCategory === 'Todos' 
    ? cityStats 
    : cityStats.filter(s => s.category === activeCategory);

  // Contenido del modal centralizado
  const modalContent = selectedStat && (
    <div 
      className="stat-modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 p-md-4"
      style={{
        backgroundColor: 'rgba(11, 37, 69, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        overflowY: 'auto'
      }}
      onClick={() => setSelectedStat(null)}
    >
      <div 
        className="stat-modal-card bg-white rounded-5 shadow-lg p-4 p-md-5 w-100 position-relative d-flex flex-column border-0" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          maxHeight: '85vh',
          overflowY: 'auto',
          margin: 'auto'
        }}
      >
        {/* Botón de Cierre Superior (X) */}
        <button 
          className="btn-close-custom btn rounded-circle border-0 text-secondary bg-light d-flex align-items-center justify-content-center position-absolute" 
          onClick={() => setSelectedStat(null)}
          aria-label="Cerrar modal"
          style={{ width: '40px', height: '40px', top: '20px', right: '20px' }}
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Encabezado Modal */}
        <div className="stat-modal-header d-flex align-items-center gap-3 mb-3 pe-4">
          <div 
            className="stat-icon-wrapper-large d-flex align-items-center justify-content-center rounded-4 p-3 shadow-sm flex-shrink-0" 
            style={{ 
              backgroundColor: `${selectedStat.color || '#B22222'}15`, 
              color: selectedStat.color || '#B22222',
              width: '60px',
              height: '60px',
              fontSize: '1.5rem'
            }}
          >
            <i className={`fas ${selectedStat.icon || 'fa-chart-bar'}`}></i>
          </div>
          <div>
            <span className="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill mb-2 fw-bold text-uppercase small" style={{ backgroundColor: `${selectedStat.color || '#B22222'}15`, color: selectedStat.color || '#B22222' }}>
              {selectedStat.badge || selectedStat.category}
            </span>
            <h3 className="h4 fw-bold mb-0 text-dark">{selectedStat.title}</h3>
          </div>
        </div>

        {/* Cuerpo Modal */}
        <div className="stat-modal-body my-2">
          <div className="display-5 fw-bold mb-2" style={{ color: selectedStat.color || '#B22222' }}>
            {(selectedStat.number || 0).toLocaleString()}{selectedStat.suffix}
          </div>
          <p className="text-secondary mb-4 lead fs-6">{selectedStat.detalles?.descripcion || selectedStat.subtitle}</p>

          {selectedStat.detalles?.desglose?.length > 0 && (
            <>
              <h6 className="fw-bold text-uppercase small text-danger mb-3" style={{ letterSpacing: '0.5px' }}>Desglose e Información Relevante:</h6>
              <div className="d-flex flex-column gap-2">
                {selectedStat.detalles.desglose.map((item, i) => (
                  <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded-4 bg-light border">
                    <span className="fw-semibold text-secondary small">{item.label}</span>
                    <span className="fw-bold text-dark small text-end ms-2">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer con Botones */}
        <div className="stat-modal-footer mt-4 pt-3 border-top d-flex gap-2 justify-content-end align-items-center">
          <button 
            className="btn btn-light px-4 py-2 rounded-pill fw-semibold text-secondary border small"
            onClick={() => setSelectedStat(null)}
          >
            Cerrar
          </button>

          {selectedStat.externalLink ? (
            <a
              href={selectedStat.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn px-4 py-2 rounded-pill fw-bold text-white small shadow-sm d-inline-flex align-items-center gap-2"
              style={{ backgroundColor: selectedStat.color || '#B22222', border: 'none' }}
            >
              Conocer más <i className="fas fa-external-link-alt small"></i>
            </a>
          ) : (
            <button 
              className="btn px-4 py-2 rounded-pill fw-bold text-white small shadow-sm"
              style={{ backgroundColor: selectedStat.color || '#B22222', border: 'none' }}
              onClick={() => setSelectedStat(null)}
            >
              Conocer más
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section id="estadisticas" ref={sectionRef} className="estadisticas-section py-5 position-relative">
      {/* Elementos Decorativos de Fondo */}
      <div className="stats-bg-glow glow-1"></div>
      <div className="stats-bg-glow glow-2"></div>

      <div className="container position-relative z-1">
        
        {/* ENCABEZADO DE SECCIÓN CON BADGE ANIMADO */}
        <div className="section-header text-center mb-5">
          <span className="stats-header-badge mb-2 d-inline-flex align-items-center gap-2">
            <span className="pulse-dot"></span>
            DATOS Y ESTADÍSTICAS EN VIVO
          </span>
          <h2 className="section-title text-gradient-main mt-2">
            Datos de León: Población, Proyectos e Indicadores Municipales
          </h2>
          <p className="section-description mx-auto" style={{ maxWidth: '720px' }}>
            Explora los datos clave de la Primera Capital de la Revolución: nuestra demografía, extensión territorial, legado cultural, proyectos viales y servicios comunitarios.
          </p>
        </div>

        {/* FILTROS POR CATEGORÍA DE DATOS */}
        <div className="stats-filters-container d-flex justify-content-center gap-2 mb-5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`stats-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* REJILLA DE TARJETAS ESTADÍSTICAS */}
        {filteredStats.length === 0 ? (
          <div className="text-center text-muted py-4">No hay estadísticas registradas para esta categoría.</div>
        ) : (
          <div className="row g-4 justify-content-center">
            {filteredStats.map((stat, idx) => {
              const externalLink = stat.linkUrl || stat.url;
              const hasExternalLink = Boolean(externalLink);

              const cardContent = (
                <div
                  className={`city-stat-card-glass h-100 ${isVisible ? 'card-animated-in' : ''}`}
                  style={{ 
                    animationDelay: `${idx * 120}ms`,
                    borderTop: `3px solid ${stat.color || '#B22222'}`
                  }}
                  title={hasExternalLink ? "Haz clic para ir al enlace externo" : "Haz clic para ver el desglose detallado"}
                >
                  <div className="stat-card-top d-flex align-items-center justify-content-between">
                    <div 
                      className="stat-icon-wrapper" 
                      style={{ 
                        backgroundColor: `${stat.color || '#B22222'}15`, 
                        color: stat.color || '#B22222',
                        boxShadow: `0 8px 20px ${stat.color || '#B22222'}25`
                      }}
                    >
                      <i className={`fas ${stat.icon || 'fa-chart-bar'}`}></i>
                    </div>
                    <span className="stat-badge-pill" style={{ backgroundColor: `${stat.color || '#B22222'}15`, color: stat.color || '#B22222' }}>
                      {stat.badge || stat.category}
                    </span>
                  </div>

                  <div className="stat-card-body mt-3">
                    <div className="stat-number-display" style={{ color: stat.color || '#B22222' }}>
                      <AnimatedValue target={stat.number} suffix={stat.suffix} isVisible={isVisible} />
                    </div>
                    <h4 className="stat-card-title mt-1">{stat.title}</h4>
                    <p className="stat-card-subtitle">{stat.subtitle}</p>
                  </div>

                  {/* Medidor de avance progresivo */}
                  <div className="stat-card-meter-bar mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="meter-label">Indicador Municipal</span>
                      <span className="meter-percentage" style={{ color: stat.color || '#B22222' }}>{stat.percentage || 100}%</span>
                    </div>
                    <div className="meter-track">
                      <div 
                        className="meter-fill" 
                        style={{ 
                          width: isVisible ? `${stat.percentage || 100}%` : '0%', 
                          backgroundColor: stat.color || '#B22222',
                          boxShadow: `0 0 10px ${stat.color || '#B22222'}`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="stat-card-footer mt-3 pt-2 d-flex align-items-center justify-content-between border-top border-secondary border-opacity-10">
                    <span className="small text-muted font-medium">
                      {hasExternalLink ? 'Ver enlace externo' : 'Ver desglose completo'}
                    </span>
                    <i className={`fas ${hasExternalLink ? 'fa-external-link-alt' : 'fa-chevron-right'} text-danger small`}></i>
                  </div>
                </div>
              );

              return (
                <div key={stat.id} className="col-lg-4 col-md-6 col-sm-12">
                  {hasExternalLink ? (
                    <a 
                      href={externalLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-decoration-none d-block h-100"
                    >
                      {cardContent}
                    </a>
                  ) : (
                    <div 
                      onClick={() => setSelectedStat({ ...stat, externalLink })} 
                      role="button" 
                      tabIndex={0}
                      className="h-100 cursor-pointer"
                    >
                      {cardContent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* BANNER INFORMATIVO ANIMADO */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="city-highlights-banner-premium">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-pill text-white small mb-2 fw-semibold">
                    <i className="fas fa-crown text-warning"></i> Ciudad Creativa y del Aprendizaje
                  </div>
                  <h3 className="fw-bold text-white mb-2">León: Primera Capital de la Revolución y Orgullo Nacional</h3>
                  <p className="text-white-50 mb-0">
                    Impulsando el desarrollo sostenible, la conservación histórica y el bienestar social de todas las familias leonesas.
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                  <a href="#proyectos" className="btn btn-light btn-lg px-4 rounded-pill fw-bold shadow-lg btn-banner-action">
                    Explorar Obras <i className="fas fa-arrow-right ms-2"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RENDERIZA EL MODAL FUERA DE LA SECCIÓN MEDIANTE PORTAL */}
      {typeof document !== 'undefined' && ReactDOM.createPortal(modalContent, document.body)}
    </section>
  );
};

export default Estadisticas;