import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

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

  // Bloquear el scroll del body cuando el modal esté abierto
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedProject(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedProject]);

  const filteredProyectos = proyectos.filter((item) => {
    const isCompleted = Number(item.progress) === 100;
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'En Progreso') return !isCompleted;
    if (activeFilter === 'Completados') return isCompleted;
    return item.category === activeFilter;
  });

  // Contenido del modal centralizado mediante Portal
  const modalContent = selectedProject && (
    <div 
      className="modal-backdrop-custom position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 p-md-4"
      style={{
        backgroundColor: 'rgba(11, 37, 69, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        overflowY: 'auto'
      }}
      onClick={() => setSelectedProject(null)}
    >
      <div 
        className="servicio-modal-content bg-white rounded-5 shadow-lg p-4 p-md-5 w-100 position-relative d-flex flex-column border-0" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Estilo para ocultar la barra de desplazamiento en Webkit */}
        <style>{`
          .servicio-modal-content::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Botón de Cierre Superior (X) */}
        <button 
          className="btn-close-custom btn rounded-circle border-0 text-secondary bg-light d-flex align-items-center justify-content-center position-absolute" 
          onClick={() => setSelectedProject(null)}
          aria-label="Cerrar modal"
          style={{ width: '40px', height: '40px', top: '20px', right: '20px', zIndex: 2 }}
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="row g-4 align-items-center">
          <div className="col-md-5">
            <img
              src={selectedProject.image || selectedProject.img}
              alt={selectedProject.title}
              className="img-fluid rounded-4 shadow-sm object-fit-cover w-100"
              style={{ maxHeight: '350px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/img/proyectos/campeche.jpg';
              }}
            />
          </div>
          <div className="col-md-7 text-start">
            <div className="mb-2">
              <span className="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill fw-bold text-uppercase small">
                {selectedProject.category}
              </span>
            </div>
            <h4 className="h4 fw-bold mb-2 text-dark">{selectedProject.title}</h4>
            <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
              {selectedProject.desc || selectedProject.summary}
            </p>

            <ul className="list-unstyled text-secondary small mb-4">
              <li className="mb-2"><strong className="text-dark"><i className="fas fa-map-marker-alt text-danger me-2"></i>Ubicación:</strong> {selectedProject.location}</li>
              <li className="mb-2"><strong className="text-dark"><i className="fas fa-coins text-warning me-2"></i>Inversión Estimada:</strong> {selectedProject.cost}</li>
              <li className="mb-2"><strong className="text-dark"><i className="fas fa-calendar-alt text-info me-2"></i>Inicio de Ejecución:</strong> {selectedProject.start_date || selectedProject.startDate || '2026'}</li>
              <li className="mb-2"><strong className="text-dark"><i className="fas fa-user-friends text-success me-2"></i>Población Beneficiada:</strong> {selectedProject.beneficiaries}</li>
              <li className="mb-2"><strong className="text-dark"><i className="fas fa-chart-line text-primary me-2"></i>Avance Físico:</strong> {selectedProject.progress}%</li>
            </ul>

            <div className="d-flex align-items-center justify-content-end pt-3 border-top">
              <button 
                className="btn btn-dark btn-sm px-4 rounded-pill fw-semibold"
                onClick={() => setSelectedProject(null)}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="proyectos" ref={sectionRef} className="proyectos-section py-5 position-relative">
      <div className="container">
        
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Obras e Inversión Municipal</span>
          <h2 className="section-title">Proyectos de Transformación en León</h2>
          <p className="section-description">
            Obras estratégicas enfocadas en mejorar la infraestructura vial, espacios públicos, mercados y conservación patrimonial.
          </p>
        </div>

        {/* FILTROS INTERACTIVOS */}
        <div className="d-flex justify-content-center gap-2 mb-5 flex-wrap">
          {['Todos', 'En Progreso', 'Completados', 'Infraestructura', 'Vialidad'].map((filter) => (
            <button
              key={filter}
              className={`btn btn-sm rounded-pill px-4 transition-all ${activeFilter === filter ? 'btn-danger shadow-sm' : 'btn-outline-secondary'}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* LISTADO DE PROYECTOS */}
        <div className="row g-4">
          {filteredProyectos.length === 0 ? (
            <div className="col-12 text-center text-muted py-4">No hay proyectos registrados para este filtro.</div>
          ) : (
            filteredProyectos.map((item, idx) => {
              const isCompleted = Number(item.progress) === 100;
              return (
                <div key={item.id} className="col-lg-6">
                  <div 
                    className={`proyecto-card shadow-sm ${isVisible ? 'proyecto-card-animated' : ''}`}
                    style={{ transitionDelay: `${idx * 120}ms` }}
                  >
                    <div className="proyecto-img-wrapper position-relative">
                      <img
                        src={item.image || item.img}
                        alt={item.title}
                        className="proyecto-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/img/proyectos/campeche.jpg';
                        }}
                      />
                      {/* ETIQUETA CENTRADA Y MÁS GRANDE */}
                      <div className="w-100 text-center position-absolute" style={{ bottom: '15px', left: 0, zIndex: 2 }}>
                        <span 
                          className={`proyecto-status shadow-sm px-3 py-2 rounded-pill fw-bold ${isCompleted ? 'bg-success text-white' : 'bg-danger text-white'}`}
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
                      
                      <div className="proyecto-meta d-flex justify-content-between text-muted small mb-3">
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

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span className="text-muted small"><i className="fas fa-users me-1 text-primary"></i> {item.beneficiaries}</span>
                        <button 
                          className="btn btn-outline-danger btn-sm rounded-pill px-3"
                          onClick={() => setSelectedProject(item)}
                        >
                          <i className="fas fa-info-circle me-1"></i> Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RENDERIZA EL MODAL FUERA DE LA SECCIÓN MEDIANTE PORTAL */}
      {typeof document !== 'undefined' && ReactDOM.createPortal(modalContent, document.body)}
    </section>
  );
};

export default Proyectos;