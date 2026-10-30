import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../services/apiService';

const fallbackImages = [
  { id: 'galeria-local-1', image: '/img/galeria/1.jpg', title: 'Catedral Basílica de la Asunción de León', description: 'Patrimonio de la Humanidad por la UNESCO y símbolo de nuestra ciudad.' },
  { id: 'galeria-local-2', image: '/img/galeria/2.jpg', title: 'Murales y Tradición Cultural Leonesa', description: 'Coloridas expresiones artísticas que conmemoran la historia viva de León.' },
  { id: 'galeria-local-3', image: '/img/galeria/3.jpg', title: 'Parque Central Juan José Quezada', description: 'Punto de encuentro, convivencia y descanso en el corazón de León.' },
  { id: 'galeria-local-4', image: '/img/galeria/4.jpg', title: 'Costas y Balneario de Poneloya', description: 'Atardeceres inolvidables y belleza natural en las costas del Pacífico leonés.' },
  { id: 'galeria-local-5', image: '/img/galeria/5.jpg', title: 'Iglesia El Calvario y Arquitectura Colonial', description: 'Colorido templo representativo de la arquitectura colonial de León.' },
  { id: 'galeria-local-6', image: '/img/galeria/6.jpg', title: 'Gigantonas y Folclor Popular Leonés', description: 'Tradiciones centenarias que llenan de alegría y música las calles leonesas.' },
  { id: 'galeria-local-7', image: '/img/galeria/7.jpg', title: 'Modernización y Espacios Públicos', description: 'Obras de infraestructura para el desarrollo urbano y bienestar ciudadano.' }
];

const Galeria = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const { data } = useQuery({
    queryKey: ['galeria', 'public'],
    queryFn: apiService.getPublicGaleria,
    staleTime: 60_000
  });

  const rawImages = (Array.isArray(data) && data.length > 0) ? data : fallbackImages;
  
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
                    src={item.image || item.image_url || item.url || item.img}
                    alt={item.title || item.titulo || `Galería León ${index + 1}`}
                    loading="lazy"
                    onError={(event) => {
                      event.target.onerror = null;
                      event.target.src = `/img/galeria/${(index % 7) + 1}.jpg`;
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
            <img src={selectedImg.image || selectedImg.image_url || selectedImg.url || selectedImg.img} alt={selectedImg.title || selectedImg.titulo || 'Vista ampliada'} />
            {(selectedImg.title || selectedImg.titulo || selectedImg.description || selectedImg.descripcion) && (
              <div className="text-center text-white mt-3">
                {(selectedImg.title || selectedImg.titulo) && <h5 className="mb-1">{selectedImg.title || selectedImg.titulo}</h5>}
                {(selectedImg.description || selectedImg.descripcion) && <p className="mb-0 small text-white-50">{selectedImg.description || selectedImg.descripcion}</p>}
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