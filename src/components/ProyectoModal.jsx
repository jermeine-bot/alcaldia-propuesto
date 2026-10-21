import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  formatUrl,
  isProjectCompleted,
  isExternalUrl,
  PROJECT_FALLBACK_IMAGE
} from '../utils/formatUrl';

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Ficha completa de un proyecto municipal.
 * Se muestra en un portal para que no la recorte ninguna sección con overflow.
 */
const ProyectoModal = ({ project, onClose }) => {
  useEffect(() => {
    if (!project) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project || typeof document === 'undefined') return null;

  const completed = isProjectCompleted(project);
  const progress = Math.min(100, Math.max(0, Number(project.progress) || 0));
  const title = cleanText(project.title) || 'Proyecto municipal';
  const summary = cleanText(project.desc || project.summary);
  const detailed = cleanText(project.detailed_desc || project.detailedDesc);
  const body = detailed || summary;
  const showSummary = summary && detailed && summary !== detailed;

  const image = project.image || project.img || PROJECT_FALLBACK_IMAGE;
  const link = formatUrl(project.linkUrl || project.url || project.link);
  const external = isExternalUrl(link);

  const facts = [
    {
      icon: 'fa-tag',
      tone: 'text-danger',
      label: 'Categoría',
      value: cleanText(project.category) || 'No especificada'
    },
    {
      icon: 'fa-flag',
      tone: completed ? 'text-success' : 'text-warning',
      label: 'Estado de la obra',
      value: completed ? 'Completado' : (cleanText(project.status) || 'En Progreso')
    },
    {
      icon: 'fa-map-marker-alt',
      tone: 'text-danger',
      label: 'Ubicación',
      value: cleanText(project.location) || 'No especificada'
    },
    {
      icon: 'fa-coins',
      tone: 'text-warning',
      label: 'Inversión estimada',
      value: cleanText(project.cost) || 'No especificada'
    },
    {
      icon: 'fa-calendar-alt',
      tone: 'text-info',
      label: 'Inicio de ejecución',
      value: cleanText(project.startDate || project.start_date) || 'No especificado'
    },
    {
      icon: 'fa-user-friends',
      tone: 'text-success',
      label: 'Población beneficiada',
      value: cleanText(project.beneficiaries) || 'No especificada'
    }
  ];

  return ReactDOM.createPortal(
    <div
      className="proyecto-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="proyecto-modal-title"
      onClick={onClose}
    >
      <div className="proyecto-modal-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="proyecto-modal-card">
          <button
            type="button"
            className="proyecto-modal-close"
            onClick={onClose}
            aria-label="Cerrar ficha del proyecto"
          >
            <i className="fas fa-times"></i>
          </button>

          <div className="proyecto-modal-hero">
            <img
              src={image}
              alt={title}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = PROJECT_FALLBACK_IMAGE;
              }}
            />
            <div className="proyecto-modal-hero-shade"></div>
            <div className="proyecto-modal-hero-badges">
              <span className="badge rounded-pill bg-white text-danger fw-bold px-3 py-2">
                {cleanText(project.category) || 'Proyecto'}
              </span>
              <span className={`badge rounded-pill px-3 py-2 ${completed ? 'bg-success' : 'bg-danger'}`}>
                <i className={`fas ${completed ? 'fa-check-circle' : 'fa-spinner fa-spin'} me-2`}></i>
                {completed ? 'Completado' : 'En progreso'}
              </span>
            </div>
          </div>

          <div className="proyecto-modal-body">
            <h3 id="proyecto-modal-title" className="fw-bold mb-3">
              {title}
            </h3>

            {summary && (
              <p className="proyecto-modal-summary">{summary}</p>
            )}

            <div className="proyecto-modal-facts">
              {facts.map((fact) => (
                <div className="proyecto-fact" key={fact.label}>
                  <i className={`fas ${fact.icon} ${fact.tone}`}></i>
                  <div>
                    <span className="proyecto-fact-label">{fact.label}</span>
                    <span className="proyecto-fact-value">{fact.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="proyecto-modal-progress">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold small">
                  <i className="fas fa-chart-line text-primary me-2"></i>
                  Avance físico de la obra
                </span>
                <span className={`fw-bold ${completed ? 'text-success' : 'text-danger'}`}>{progress}%</span>
              </div>
              <div className="progress rounded-pill" style={{ height: 10 }}>
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

            <div className="proyecto-modal-section">
              <h4 className="h6 fw-bold mb-3">
                <i className="fas fa-align-left text-danger me-2"></i>
                {showSummary ? 'Descripción completa del proyecto' : 'Descripción del proyecto'}
              </h4>
              {body ? (
                <div className="proyecto-modal-text">{body}</div>
              ) : (
                <p className="text-muted mb-0">Este proyecto todavía no tiene una descripción ampliada.</p>
              )}
            </div>

            <div className="proyecto-modal-footer">
              <button type="button" className="btn btn-light border rounded-pill px-4 fw-semibold" onClick={onClose}>
                Cerrar ficha
              </button>
              {link ? (
                <a
                  href={link}
                  target={external ? '_blank' : '_self'}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="btn btn-danger rounded-pill px-4 fw-semibold text-white d-inline-flex align-items-center gap-2"
                >
                  Conocer más
                  <i className={`fas ${external ? 'fa-external-link-alt' : 'fa-arrow-right'} small`}></i>
                </a>
              ) : (
                <a
                  href="/#contacto"
                  className="btn btn-danger rounded-pill px-4 fw-semibold text-white d-inline-flex align-items-center gap-2"
                >
                  Contactar a la Alcaldía
                  <i className="fas fa-arrow-right small"></i>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProyectoModal;
