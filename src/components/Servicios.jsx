import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { initialServiciosSettings } from '../services/initialData';

const formatUrl = (url) => {
  if (!url || !url.trim()) return '';
  const value = url.trim();
  return /^(https?:\/\/|\/|#)/i.test(value) ? value : `https://${value}`;
};

const Servicios = () => {
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedTrasnaccionRequisitos, setSelectedTrasnaccionRequisitos] = useState(null); // Estado para el modal de requisitos del trámite

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
    if (selectedCategoria || selectedTrasnaccionRequisitos) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSelectedTrasnaccionRequisitos(null);
          setSelectedCategoria(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedCategoria, selectedTrasnaccionRequisitos]);

  // Contenido del modal principal de Categoría con pestañas
  const modalContent = selectedCategoria && (
    <div
      className="modal-backdrop-custom position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 p-md-4"
      style={{ backgroundColor: 'rgba(11, 37, 69, 0.65)', backdropFilter: 'blur(5px)', zIndex: 99999, overflowY: 'auto' }}
      onClick={() => setSelectedCategoria(null)}
    >
      <div
        className="servicio-modal-content bg-white rounded-5 shadow-lg p-4 p-md-5 w-100 position-relative d-flex flex-column border-0"
        style={{ 
          maxWidth: '900px', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          margin: 'auto',
          scrollbarWidth: 'none',    /* Oculta scroll en Firefox */
          msOverflowStyle: 'none',    /* Oculta scroll en IE/Edge antiguo */
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Estilo para ocultar la barra de desplazamiento en Webkit (Chrome, Safari, Opera) */}
        <style>{`
          .servicio-modal-content::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* MODAL HEADER */}
        <div className="modal-header-custom d-flex align-items-start justify-content-between mb-3 border-bottom pb-4">
          <div className="d-flex align-items-center gap-3 pe-3">
            <div className="servicio-icon m-0 modal-icon-glow flex-shrink-0 bg-danger text-white rounded-4 p-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
              <i className={`fas ${selectedCategoria.icon}`}></i>
            </div>
            <div>
              <span className="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill mb-2 fw-bold text-uppercase small">
                {selectedCategoria.badgeIcon} {selectedCategoria.title}
              </span>
              <h3 className="h4 fw-bold mb-0 text-dark">{selectedCategoria.subtitle}</h3>
            </div>
          </div>
          <button
            type="button"
            className="btn-close-custom btn rounded-circle border-0 text-secondary bg-light d-flex align-items-center justify-content-center"
            onClick={() => setSelectedCategoria(null)}
            aria-label="Cerrar modal"
            style={{ width: '40px', height: '40px' }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* SELECTOR DE CATEGORÍAS */}
        <div className="modal-tabs-container mb-4 pb-2 border-bottom">
          <label className="form-label small text-muted fw-semibold mb-2 d-block">Cambiar de categoría:</label>
          <div className="d-flex flex-wrap gap-2">
            {categoriasServicios.map((tab) => (
              <button
                key={tab.id}
                className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold transition-all d-flex align-items-center gap-1 ${
                  selectedCategoria.id === tab.id
                    ? 'btn-danger shadow-sm'
                    : 'btn-light text-dark border bg-white'
                }`}
                onClick={() => setSelectedCategoria(tab)}
              >
                <span>{tab.badgeIcon || '📁'}</span>
                <span>{tab.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DESCRIPCIÓN CATEGORÍA */}
        <p className="text-secondary mb-4 lead fs-6">{selectedCategoria.desc}</p>

        {/* GRID DE SUB-SERVICIOS / TRÁMITES */}
        <div className="row g-3">
          {selectedCategoria.opciones?.map((opcion, idx) => (
            <div key={opcion.id || idx} className="col-12 col-md-6">
              <div className="subservicio-item p-4 rounded-4 border bg-white h-100 d-flex flex-column shadow-hover transition-all">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div className="subservicio-icon-box rounded-3 p-3 bg-danger-subtle text-danger d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '45px', height: '45px' }}>
                    <i className={`fas ${opcion.icon || 'fa-file-alt'}`}></i>
                  </div>
                  <div>
                    <h5 className="h6 fw-bold mb-1 text-dark">{opcion.title}</h5>
                    <p className="small text-muted mb-0">{opcion.desc}</p>
                  </div>
                </div>
                <div className="mt-auto pt-3 d-flex justify-content-end align-items-center gap-2 flex-wrap border-top-dashed">
                  {opcion.linkUrl && (
                    <a
                      href={formatUrl(opcion.linkUrl)}
                      target={/^https?:\/\//i.test(formatUrl(opcion.linkUrl)) ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-danger rounded-pill px-4 fw-semibold"
                    >
                      {opcion.linkText || 'Más información'} <i className="fas fa-external-link-alt ms-1 small"></i>
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger rounded-pill px-4 fw-semibold"
                    onClick={() => setSelectedTrasnaccionRequisitos(opcion)}
                  >
                    Ver requisitos <i className="fas fa-chevron-right ms-1 small"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER MODAL */}
        <div className="modal-footer-custom mt-5 pt-3 border-top text-center d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <span className="small text-muted d-flex align-items-center">
            <i className="fas fa-headset me-2 text-danger fs-5"></i> Atención directa en ventanilla: <strong className="ms-1 text-dark">{sectionSettings.phone}</strong>
          </span>
          <button
            className="btn btn-dark btn-sm px-4 py-2 rounded-pill fw-semibold"
            onClick={() => setSelectedCategoria(null)}
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );

  // MODAL SECUNDARIO: Muestra los requisitos y el departamento del trámite seleccionado
  const requisitosModalContent = selectedTrasnaccionRequisitos && (
    <div
      className="modal-backdrop-custom position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(3px)', zIndex: 100000 }}
      onClick={() => setSelectedTrasnaccionRequisitos(null)}
    >
      <div
        className="bg-white rounded-4 shadow-lg p-4 w-100 position-relative border-0"
        style={{ maxWidth: '550px', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-danger-subtle text-danger p-2 rounded-3">
              <i className="fas fa-list-check"></i>
            </div>
            <h5 className="fw-bold mb-0 text-dark">Requisitos del Trámite</h5>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSelectedTrasnaccionRequisitos(null)}
            aria-label="Cerrar"
          ></button>
        </div>

        {/* Título del trámite */}
        <div className="mb-3 p-3 bg-light rounded-3 border">
          <span className="text-uppercase fw-bold text-muted d-block" style={{ fontSize: '0.7rem' }}>Trámite:</span>
          <h6 className="fw-bold text-dark mb-0">{selectedTrasnaccionRequisitos.title}</h6>
        </div>

        {/* Viñetas de Requisitos */}
        <div className="mb-3">
          <label className="form-label fw-semibold small text-muted">Requisitos necesarios:</label>
          {(!selectedTrasnaccionRequisitos.requisitos || selectedTrasnaccionRequisitos.requisitos.length === 0) ? (
            <p className="text-muted small italic p-2 border rounded bg-white text-center">No hay requisitos especificados para este trámite.</p>
          ) : (
            <ul className="list-group list-group-flush border rounded bg-white small">
              {selectedTrasnaccionRequisitos.requisitos.map((req, i) => (
                <li key={i} className="list-group-item py-2 d-flex align-items-start gap-2">
                  <i className="fas fa-check-circle text-danger mt-1 flex-shrink-0"></i>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Departamento del trámite */}
        <div className="mb-4 p-3 bg-light rounded-3 border d-flex align-items-center gap-3">
          <div className="text-danger fs-4">
            <i className="fas fa-building"></i>
          </div>
          <div>
            <span className="text-uppercase fw-bold text-muted d-block" style={{ fontSize: '0.7rem' }}>Departamento responsable:</span>
            <span className="fw-semibold text-dark">{selectedTrasnaccionRequisitos.departamento || 'No especificado'}</span>
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="d-flex justify-content-end align-items-center gap-2 flex-wrap">
          {selectedTrasnaccionRequisitos.linkUrl && (
            <a
              href={formatUrl(selectedTrasnaccionRequisitos.linkUrl)}
              target={/^https?:\/\//i.test(formatUrl(selectedTrasnaccionRequisitos.linkUrl)) ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="btn btn-outline-danger btn-sm px-4 rounded-pill fw-semibold"
            >
              {selectedTrasnaccionRequisitos.linkText || 'Más información'}
            </a>
          )}
          <button
            type="button"
            className="btn btn-danger btn-sm px-4 rounded-pill fw-semibold"
            onClick={() => setSelectedTrasnaccionRequisitos(null)}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section id="servicios" className="servicios-section py-5 position-relative">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill mb-3 fw-bold small text-uppercase">
            {sectionSettings.eyebrow}
          </span>
          <h2 className="section-title fw-bold text-dark mb-3">{sectionSettings.title}</h2>
          <p className="section-description text-muted mx-auto" style={{ maxWidth: '650px' }}>{sectionSettings.description}</p>
        </div>

        {/* CONTENEDOR DE LAS CATEGORÍAS PRINCIPALES */}
        <div className="row g-4 justify-content-center">
          {categoriasServicios.map((cat) => (
            <div key={cat.id} className="col-lg-3 col-md-6 col-sm-12">
              <div
                className="servicio-categoria-card h-100 p-4 rounded-4 shadow-sm bg-white border position-relative overflow-hidden d-flex flex-column transition-all cursor-pointer"
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
                <div className="card-bg-glow position-absolute top-0 end-0 p-4 opacity-10 text-danger pointer-events-none">
                  <i className={`fas ${cat.icon} fa-4x`}></i>
                </div>

                <div className="categoria-card-top d-flex align-items-center justify-content-between mb-4 position-relative z-1">
                  <div className="servicio-icon mb-0 rounded-4 bg-danger-subtle text-danger p-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '55px', height: '55px', fontSize: '1.25rem' }}>
                    <i className={`fas ${cat.icon}`}></i>
                  </div>
                  <span className="badge bg-light text-secondary border px-3 py-1 rounded-pill fw-semibold small">
                    {cat.badgeIcon || '📁'} {cat.opciones?.length || cat.count || 0} opciones
                  </span>
                </div>

                <div className="position-relative z-1 mb-3">
                  <h4 className="categoria-title fw-bold text-dark mb-2 fs-5">{cat.title}</h4>
                  <p className="categoria-subtitle text-muted small mb-0">{cat.subtitle}</p>
                </div>

                <div className="categoria-card-footer d-flex align-items-center justify-content-between pt-3 border-top mt-auto position-relative z-1">
                  <span className="servicio-link text-danger text-decoration-none fw-semibold small d-flex align-items-center">
                    Explorar Opciones <i className="fas fa-arrow-right ms-2"></i>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RENDERIZA LOS MODALES FUERA DE LA SECCIÓN DIRECTAMENTE EN EL BODY */}
      {typeof document !== 'undefined' && ReactDOM.createPortal(
        <>
          {modalContent}
          {requisitosModalContent}
        </>,
        document.body
      )}
    </section>
  );
};

export default Servicios;