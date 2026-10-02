import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { initialServiciosSettings } from '../services/initialData';

const Servicios = () => {
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  // Fetch de los Servicios desde CMS
  const { data: categoriasServicios = [] } = useQuery({
    queryKey: ['servicios'],
    queryFn: apiService.getServicios
  });

  const { data: sectionSettings = initialServiciosSettings } = useQuery({
    queryKey: ['servicios-settings'],
    queryFn: apiService.getServiciosSettings,
    initialData: initialServiciosSettings
  });

  // Mantener seleccionada la categoría actualizada si cambia el arreglo en tiempo real
  useEffect(() => {
    if (selectedCategoria) {
      const updated = categoriasServicios.find((c) => c.id === selectedCategoria.id);
      if (updated) {
        setSelectedCategoria(updated);
      }
    }
  }, [categoriasServicios]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (selectedCategoria) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedCategoria(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedCategoria]);

  const handleOptionClick = (e, linkUrl) => {
    if (!linkUrl || linkUrl === '#contacto') {
      setSelectedCategoria(null);
      const targetElement = document.getElementById('contacto');
      if (targetElement) {
        e.preventDefault();
        const headerHeight = 70;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    } else if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
      // Abre en nueva ventana si es un link externo
      setSelectedCategoria(null);
    }
  };

  return (
    <section id="servicios" className="servicios-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">{sectionSettings.eyebrow}</span>
          <h2 className="section-title">{sectionSettings.title}</h2>
          <p className="section-description">{sectionSettings.description}</p>
        </div>

        {/* CONTENEDOR DE LAS CATEGORÍAS PRINCIPALES */}
        <div className="row g-4 justify-content-center">
          {categoriasServicios.map((cat) => (
            <div key={cat.id} className="col-lg-3 col-md-6 col-sm-12">
              <div
                className="servicio-categoria-card h-100 p-4 rounded-4 shadow-sm"
                onClick={() => setSelectedCategoria(cat)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCategoria(cat);
                  }
                }}
              >
                <div className="categoria-card-top d-flex align-items-center justify-content-between mb-3">
                  <div className="servicio-icon mb-0">
                    <i className={`fas ${cat.icon}`}></i>
                  </div>
                  <span className="categoria-badge">
                    {cat.badgeIcon || '📁'} {cat.opciones?.length || cat.count || 0} opciones
                  </span>
                </div>

                <h4 className="categoria-title fw-bold text-dark mb-2">{cat.title}</h4>
                <p className="categoria-subtitle text-muted mb-3">{cat.subtitle}</p>

                <div className="categoria-card-footer d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                  <span className="servicio-link text-decoration-none fw-semibold">
                    Explorar Opciones <i className="fas fa-arrow-right ms-1"></i>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DETALLE DE CATEGORÍA DE SERVICIOS */}
      {selectedCategoria && (
        <div
          className="modal-backdrop-custom d-flex align-items-center justify-content-center"
          onClick={() => setSelectedCategoria(null)}
        >
          <div
            className="servicio-modal-content rounded-4 shadow-lg p-4 p-md-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="modal-header-custom d-flex align-items-start justify-content-between mb-4 border-bottom pb-3">
              <div className="d-flex align-items-center gap-3">
                <div className="servicio-icon m-0 modal-icon-glow">
                  <i className={`fas ${selectedCategoria.icon}`}></i>
                </div>
                <div>
                  <span className="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill mb-1 fw-bold">
                    {selectedCategoria.badgeIcon} {selectedCategoria.title}
                  </span>
                  <h3 className="h4 fw-bold mb-0 text-dark">{selectedCategoria.subtitle}</h3>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-custom btn rounded-circle border-0 text-secondary"
                onClick={() => setSelectedCategoria(null)}
                aria-label="Cerrar modal"
              >
                <i className="fas fa-times fa-lg"></i>
              </button>
            </div>

            {/* TAB SELECTOR RÁPIDO ENTRE CATEGORÍAS */}
            <div className="modal-tabs-selector d-flex gap-2 overflow-x-auto pb-3 mb-4 border-bottom">
              {categoriasServicios.map((tab) => (
                <button
                  key={tab.id}
                  className={`btn btn-sm text-nowrap rounded-pill px-3 transition-all ${
                    selectedCategoria.id === tab.id
                      ? 'btn-danger fw-semibold shadow-sm'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => setSelectedCategoria(tab)}
                >
                  {tab.badgeIcon || '📁'} {tab.title}
                </button>
              ))}
            </div>

            {/* DESCRIPCIÓN CATEGORÍA */}
            <p className="text-secondary mb-4">{selectedCategoria.desc}</p>

            {/* GRID DE SUB-SERVICIOS / OPCIONES */}
            <div className="row g-3">
              {selectedCategoria.opciones?.map((opcion, idx) => {
                const targetUrl = opcion.linkUrl || '#contacto';
                const isExternal = targetUrl.startsWith('http://') || targetUrl.startsWith('https://');

                return (
                  <div key={opcion.id || idx} className="col-12 col-md-6">
                    <div className="subservicio-item p-3 rounded-3 border h-100 d-flex flex-column">
                      <div className="d-flex align-items-start gap-3 mb-2">
                        <div className="subservicio-icon-box rounded-3 p-2 d-flex align-items-center justify-content-center">
                          <i className={`fas ${opcion.icon || 'fa-file-alt'}`}></i>
                        </div>
                        <div>
                          <h5 className="h6 fw-bold mb-1 text-dark">{opcion.title}</h5>
                          <p className="small text-muted mb-2 line-clamp-2">{opcion.desc}</p>
                        </div>
                      </div>
                      <div className="mt-auto pt-2 text-end">
                        <a
                          href={targetUrl}
                          target={isExternal ? '_blank' : '_self'}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          className="btn btn-sm btn-outline-danger rounded-pill px-3"
                          onClick={(e) => handleOptionClick(e, targetUrl)}
                        >
                          {opcion.linkText || 'Acceder'} <i className="fas fa-chevron-right ms-1 small"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FOOTER MODAL */}
            <div className="modal-footer-custom mt-4 pt-3 border-top text-center text-md-between d-flex flex-column flex-md-row align-items-center gap-3">
              <span className="small text-muted">
                <i className="fas fa-info-circle me-1 text-danger"></i> Para orientación directa en ventanilla llama al <strong>{sectionSettings.phone}</strong>
              </span>
              <button
                className="btn btn-secondary btn-sm px-4 rounded-pill"
                onClick={() => setSelectedCategoria(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Servicios;


