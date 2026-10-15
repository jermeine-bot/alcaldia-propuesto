import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, ExternalLink, Megaphone, SkipForward } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5505/api';

const defaultAnuncio = {
  isActive: true,
  badge: 'Aviso Importante',
  title: 'Comunicado Oficial — Alcaldía Municipal de León',
  description: 'Conoce las nuevas jornadas, trámites en línea y actividades municipales.',
  image: '/img/turismo/catedral.jpg',
  linkUrl: '',
  buttonText: 'Ver más información',
  showOncePerSession: false
};

const formatUrl = (url) => {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const AnuncioModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: anuncio } = useQuery({
    queryKey: ['cms', 'anuncio-portal'],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE}/cms/anuncio-portal`);
        if (res.ok) {
          const json = await res.json();
          const parsed = json?.content
            ? typeof json.content === 'string'
              ? JSON.parse(json.content)
              : json.content
            : json;
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0 && parsed.image) {
            return parsed;
          }
        }
      } catch (e) {}
      const saved = localStorage.getItem('cms_anuncio_portal');
      return saved ? JSON.parse(saved) : defaultAnuncio;
    }
  });

  useEffect(() => {
    if (!anuncio || !anuncio.isActive || !anuncio.image) {
      setIsOpen(false);
      return;
    }

    const sessionKey = `anuncio_visto_${anuncio.updatedAt || anuncio.title || 'actual'}`;
    if (anuncio.showOncePerSession && sessionStorage.getItem(sessionKey)) {
      return;
    }

    let checkInterval = null;
    let openTimer = null;
    const startTime = Date.now();

    // Detecta tu componente <Preloader /> para esperar a que termine la intro
    const isPreloaderFinished = () => {
      const selectors = [
        '.preloader',
        '#preloader',
        '.intro-screen',
        '.splash-screen',
        '[class*="preloader"]',
        '[class*="Preloader"]',
        '[id*="preloader"]'
      ];
      const els = document.querySelectorAll(selectors.join(','));
      for (const el of els) {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const isVisible =
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          parseFloat(style.opacity || '1') > 0.05 &&
          rect.width > 0 &&
          rect.height > 0;
        if (isVisible) {
          return false;
        }
      }
      return true;
    };

    // Damos 600ms iniciales para que <Preloader /> se monte y luego verificamos cuándo desaparece
    const initialWait = setTimeout(() => {
      if (isPreloaderFinished()) {
        openTimer = setTimeout(() => setIsOpen(true), 450);
      } else {
        checkInterval = setInterval(() => {
          // Si ya terminó el Preloader o pasaron más de 7 segundos como máximo
          if (isPreloaderFinished() || Date.now() - startTime > 7000) {
            clearInterval(checkInterval);
            openTimer = setTimeout(() => setIsOpen(true), 500);
          }
        }, 250);
      }
    }, 600);

    return () => {
      clearTimeout(initialWait);
      if (openTimer) clearTimeout(openTimer);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [anuncio]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, anuncio]);

  const handleClose = () => {
    setIsOpen(false);
    if (anuncio?.showOncePerSession) {
      const sessionKey = `anuncio_visto_${anuncio.updatedAt || anuncio.title || 'actual'}`;
      sessionStorage.setItem(sessionKey, 'true');
    }
  };

  if (!isOpen || !anuncio || !anuncio.isActive || !anuncio.image) return null;

  const targetLink = formatUrl(anuncio.linkUrl);

  const flyerImage = (
    <img
      src={anuncio.image}
      alt={anuncio.title || 'Aviso Institucional'}
      className="img-fluid w-100 d-block"
      style={{
        maxHeight: '68vh',
        objectFit: 'contain',
        backgroundColor: '#0d0f12',
        cursor: targetLink ? 'pointer' : 'default'
      }}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/img/turismo/catedral.jpg';
      }}
    />
  );

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      onClick={handleClose}
      style={{
        backgroundColor: 'rgba(10, 12, 16, 0.82)',
        backdropFilter: 'blur(7px)',
        WebkitBackdropFilter: 'blur(7px)',
        zIndex: 2050
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: '540px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border-0 shadow-lg overflow-hidden position-relative"
          style={{ borderRadius: '18px' }}
        >
          {/* Botones superiores para Saltar o Quitar */}
          <div
            className="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2"
            style={{ zIndex: 20 }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-dark btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1 shadow"
              style={{
                opacity: 0.92,
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <span>Saltar anuncio</span>
              <SkipForward size={14} />
            </button>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Quitar anuncio"
              title="Quitar anuncio (Esc)"
              className="btn btn-danger rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#B22222',
                border: '2px solid rgba(255,255,255,0.5)'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {targetLink ? (
            <a
              href={targetLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="d-block text-decoration-none"
              title={anuncio.buttonText || 'Ir al enlace del anuncio'}
            >
              {flyerImage}
            </a>
          ) : (
            flyerImage
          )}

          <div className="p-3 bg-white text-center border-top">
            {anuncio.badge && (
              <span className="badge bg-danger-subtle text-danger mb-2 d-inline-flex align-items-center gap-1">
                <Megaphone size={12} /> {anuncio.badge}
              </span>
            )}
            {anuncio.title && (
              <h5 className="fw-bold text-dark mb-1">{anuncio.title}</h5>
            )}
            {anuncio.description && (
              <p className="text-secondary small mb-3">{anuncio.description}</p>
            )}

            <div className="d-flex justify-content-center flex-wrap gap-2">
              {targetLink && (
                <a
                  href={targetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className="btn btn-danger btn-sm px-4 fw-semibold d-inline-flex align-items-center gap-2 rounded-pill"
                  style={{ backgroundColor: '#B22222' }}
                >
                  <span>{anuncio.buttonText || 'Ver más información'}</span>
                  <ExternalLink size={15} />
                </a>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline-secondary btn-sm px-4 rounded-pill fw-semibold"
              >
                Quitar / Continuar al sitio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnuncioModal;