import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../services/apiService';

const fallbackImages = Array.from({ length: 12 }, (_, index) => ({
  id: `galeria-local-${index + 1}`,
  image: `/img/galeria/${(index % 7) + 1}.jpg`,
  title: `Galería León ${index + 1}`,
  description: ''
}));

const Galeria = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const { data } = useQuery({
    queryKey: ['galeria', 'public'],
    queryFn: apiService.getPublicGaleria,
    staleTime: 60_000
  });

  const rawImages = data === undefined ? fallbackImages : data;
  
  // Tomamos hasta 9 imágenes para móviles (dejando espacio para la card 8) 
  // o hasta 11 para desktop (dejando espacio para la card 10).
  // Usamos clases CSS de Bootstrap para alternar cuántas se muestran en pantalla.
  const maxImagesNeeded = 9; // Máximo base a renderizar antes de la card
  const displayImages = rawImages.slice(0, maxImagesNeeded);
  const hasMoreGallery = rawImages.length > 0;

  const selectedImg = selectedIndex === null ? null : displayImages[selectedIndex];

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= displayImages.length) {
      setSelectedIndex(null);
    }
  }, [selectedIndex, displayImages.length]);

  useEffect(() => {
    if (selectedIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedIndex(null);
      if (event.key === 'ArrowRight') setSelectedIndex((index) => (index + 1) % displayImages.length);
      if (event.key === 'ArrowLeft') setSelectedIndex((index) => (index - 1 + displayImages.length) % displayImages.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, displayImages.length]);

  const navigate = (direction) => {
    setSelectedIndex((index) => (index + direction + displayImages.length) % displayImages.length);
  };

  return (
    <section id="galeria" className="galeria-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Imágenes</span>
          <h2 className="section-title">Galería</h2>
          <p className="section-description">Capturando los momentos más importantes de nuestra ciudad</p>
        </div>

        {rawImages.length === 0 ? (
          <p className="text-center text-muted mb-0">Muy pronto compartiremos nuevas imágenes de nuestra ciudad.</p>
        ) : (
          <div className="gallery-grid">
            {displayImages.map((item, index) => {
              // Definimos si esta imagen en específico debe ocultarse en móvil para cumplir con el límite de 8 elementos totales (7 fotos + 1 card)
              // Es decir, las fotos desde el índice 7 en adelante (la 8 y 9) solo se muestran en computadoras (md en adelante).
              const isDesktopOnly = index >= 7;

              return (
                <div 
                  key={item.id || index} 
                  className={`gallery-item ${isDesktopOnly ? 'd-none d-md-block' : ''}`} 
                  onClick={() => setSelectedIndex(index)}
                >
                  <img
                    src={item.image}
                    alt={item.title || `Galería León ${index + 1}`}
                    loading="lazy"
                    onError={(event) => {
                      event.target.src = `https://via.placeholder.com/400?text=Galeria+${index + 1}`;
                    }}
                  />
                  <div className="gallery-overlay">
                    <i className="fas fa-search-plus"></i>
                  </div>
                </div>
              );
            })}

            {/* TARJETA ESPECIAL "VER MÁS FOTOS" */}
            {hasMoreGallery && (
              <div className="gallery-item gallery-card-more d-flex flex-column justify-content-center align-items-center text-center p-4 bg-danger text-white rounded-4 shadow-sm">
                <div className="mb-2">
                  <i className="fas fa-images fa-2x text-white-50"></i>
                </div>
                <h5 className="fw-bold mb-2 text-white">¿Quieres ver más fotos?</h5>
                <p className="small text-white-50 mb-3 d-none d-sm-block">
                  Explora todo el archivo fotográfico de León.
                </p>
                <Link
                  to="/galeria"
                  className="btn btn-light rounded-pill px-3 py-2 fw-semibold text-danger d-inline-flex align-items-center gap-2 shadow-sm btn-sm"
                >
                  Ver más fotos
                  <i className="fas fa-arrow-right small"></i>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedImg && (
        <div className="lightbox-modal" onClick={() => setSelectedIndex(null)}>
          <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
            <span className="lightbox-close" onClick={() => setSelectedIndex(null)}>&times;</span>
            <img src={selectedImg.image} alt={selectedImg.title || 'Vista ampliada'} />
            {(selectedImg.title || selectedImg.description) && (
              <div className="text-center text-white mt-3">
                {selectedImg.title && <h5 className="mb-1">{selectedImg.title}</h5>}
                {selectedImg.description && <p className="mb-0 small text-white-50">{selectedImg.description}</p>}
              </div>
            )}
            {displayImages.length > 1 && (
              <>
                <button type="button" className="lightbox-nav lightbox-nav-prev" onClick={() => navigate(-1)} aria-label="Imagen anterior">
                  <ChevronLeft size={26} />
                </button>
                <button type="button" className="lightbox-nav lightbox-nav-next" onClick={() => navigate(1)} aria-label="Imagen siguiente">
                  <ChevronRight size={26} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Galeria;