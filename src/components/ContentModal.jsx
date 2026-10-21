import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const formatUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/**
 * Modal reutilizable para mostrar el contenido completo de una noticia o destino.
 * Se monta en un portal para no quedar recortado por el overflow del Swiper.
 */
const ContentModal = ({
  open,
  onClose,
  image,
  fallbackImage = '/img/noticias/noticia1.jpg',
  eyebrow,
  meta,
  title,
  description,
  content,
  link,
  linkText = 'Abrir enlace original'
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const cleanLink = formatUrl(link);
  const isExternal = /^https?:\/\//i.test(cleanLink);
  const trimmedDescription = (description || '').trim();
  const body = (content || '').trim() || trimmedDescription;

  return ReactDOM.createPortal(
    <div
      className="modal d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Contenido'}
      style={{ backgroundColor: 'rgba(12, 14, 18, 0.78)', backdropFilter: 'blur(4px)', zIndex: 2000 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(event) => event.stopPropagation()}>
        <div
          className="modal-content border-0 shadow-lg position-relative"
          style={{ borderRadius: 18, overflow: 'hidden', maxHeight: '90vh' }}
        >
          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-inline-flex align-items-center justify-content-center"
            style={{ width: 40, height: 40, zIndex: 2 }}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <i className="fas fa-times"></i>
          </button>

          {image && (
            <img
              src={image}
              alt={title || ''}
              style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block' }}
              onError={(event) => {
                event.currentTarget.onerror = null;
                if (fallbackImage) event.currentTarget.src = fallbackImage;
              }}
            />
          )}

          <div className="modal-body p-4 p-md-5" style={{ overflowY: 'auto' }}>
            {(eyebrow || meta) && (
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                {eyebrow && (
                  <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2">{eyebrow}</span>
                )}
                {meta && <span className="text-muted small">{meta}</span>}
              </div>
            )}

            {title && <h3 className="fw-bold mb-3">{title}</h3>}

            {trimmedDescription && body !== trimmedDescription && (
              <p className="text-muted">{trimmedDescription}</p>
            )}

            {body ? (
              <div className="text-secondary" style={{ whiteSpace: 'pre-line', lineHeight: 1.85 }}>{body}</div>
            ) : (
              <p className="text-muted mb-0">Este contenido todavía no tiene una descripción ampliada.</p>
            )}

            {cleanLink && (
              <a
                href={cleanLink}
                target={isExternal ? '_blank' : '_self'}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="btn btn-danger rounded-pill px-4 mt-4 d-inline-flex align-items-center gap-2"
              >
                {linkText}
                <i className={isExternal ? 'fas fa-external-link-alt' : 'fas fa-arrow-right'}></i>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ContentModal;
