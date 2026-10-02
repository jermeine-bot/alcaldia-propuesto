import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

// Lista de ejemplo para las sugerencias de búsqueda (puedes adaptarla o traerla de tu API)
const searchSuggestionsList = [
  { title: 'Trámite de Alcantarillado y Agua', category: 'Servicios', link: '#servicios' },
  { title: 'Catedral de León (Patrimonio)', category: 'Turismo', link: '#turismo' },
  { title: 'Noticias Municipales Recientes', category: 'Noticias', link: '#noticias' },
  { title: 'Proyectos de Desarrollo Urbano', category: 'Proyectos', link: '#proyectos' },
  { title: 'Horarios de Atención Ciudadana', category: 'Contacto', link: '#contacto' },
  { title: 'Estadísticas de Población', category: 'Información', link: '#estadisticas' }
];

const Hero = () => {
  const [offsetY, setOffsetY] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  const { data: hero } = useQuery({
    queryKey: ['hero'],
    queryFn: apiService.getHero
  });

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.pageYOffset);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Manejador para cerrar las sugerencias al hacer clic fuera del buscador
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar sugerencias según lo que escriba el usuario (o mostrar todas si el campo está vacío al tocarlo)
  const filteredSuggestions = searchSuggestionsList.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const badgeText = hero?.badgeText || 'Alcaldía Municipal de León';
  const title = hero?.title || 'BIENVENIDOS A LA CIUDAD UNIVERSITARIA Y METROPOLITANA';
  const subtitle = hero?.subtitle || 'Construyendo juntos el futuro de nuestra ciudad, con transparencia, innovación y compromiso con cada leonés.';
  const videoUrl = hero?.videoUrl || '/video/leon nicaragua vista de un dron.mp4';
  const fallbackImg = hero?.fallbackImg || '/img/hero-bg.jpg';
  const primaryBtnText = hero?.primaryBtnText || 'Conoce León';
  const primaryBtnLink = hero?.primaryBtnLink || '#turismo';
  const secondaryBtnText = hero?.secondaryBtnText || 'Servicios Rápidos';
  const secondaryBtnLink = hero?.secondaryBtnLink || '#servicios';

  return (
    <section id="hero" className="hero-section">
      <div className="hero-video-wrapper">
        <video autoPlay muted loop playsInline className="hero-video" key={videoUrl}>
          <source src={videoUrl} type="video/mp4" />
          <img src={fallbackImg} alt="León Nicaragua" className="hero-fallback" />
        </video>
        <div className="hero-overlay"></div>
      </div>

      <div
        className="hero-content container"
        style={{
          transform: `translateY(${offsetY * 0.35}px)`,
          opacity: Math.max(0, 1 - offsetY / 700)
        }}
      >
        {/* Usamos px-3 en móvil para evitar que el contenido pegue en las esquinas, y mx-auto para centrar */}
        <div className="row hero-inner-row align-items-center justify-content-center text-center">
          <div className="col-lg-9 col-xl-8 px-4 px-md-3">
            {badgeText && (
              <span className="badge bg-danger mb-3 px-3 py-2 text-uppercase letter-spacing-1">
                {badgeText}
              </span>
            )}
            <h1 className="hero-title" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>{title}</h1>
            <p className="hero-subtitle mb-4" style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)' }}>{subtitle}</p>

            {/* MOTOR DE BÚSQUEDA TRANSPARENTE ADAPTADO A MÓVIL */}
            <div className="hero-search-container position-relative mb-4 mx-auto" ref={searchRef} style={{ maxWidth: '650px', width: '100%' }}>
              <div 
                className="input-group input-group-lg shadow-lg rounded-pill overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.35)'
                }}
              >
                <span className="input-group-text bg-transparent border-0 text-white ps-3 ps-md-4">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-transparent border-0 text-white shadow-none ps-2 py-3"
                  placeholder="¿Qué buscas? (Trámites, turismo...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  style={{ fontSize: '0.95rem', color: '#fff' }}
                />
              </div>

              {/* LISTA DE SUGERENCIAS DESPLEGABLE */}
              {isFocused && (
                <div 
                  className="suggestions-dropdown position-absolute w-100 bg-white shadow-lg rounded-4 mt-2 overflow-hidden text-start" 
                  style={{ zIndex: 1000, maxHeight: '260px', overflowY: 'auto' }}
                >
                  <div className="p-2 bg-light border-bottom text-muted small fw-bold px-3">
                    {searchTerm ? 'Resultados sugeridos' : 'Sugerencias populares'}
                  </div>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item, index) => (
                      <a
                        key={index}
                        href={item.link}
                        className="dropdown-item d-flex justify-content-between align-items-center px-3 py-2 border-bottom text-dark text-decoration-none"
                        onClick={() => setIsFocused(false)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="text-truncate me-2 fw-medium" style={{ fontSize: '0.9rem' }}>{item.title}</span>
                        <span className="badge bg-danger text-white font-monospace flex-shrink-0" style={{ fontSize: '0.7rem' }}>
                          {item.category}
                        </span>
                      </a>
                    ))
                  ) : (
                    <div className="p-3 text-center text-muted small">
                      No se encontraron sugerencias para &quot;{searchTerm}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hero-buttons d-flex justify-content-center flex-wrap gap-2">
              <a href={primaryBtnLink} className="btn btn-outline-light btn-lg">
                <i className="fas fa-compass"></i> {primaryBtnText}
              </a>
              <a href={secondaryBtnLink} className="btn btn-primary btn-lg">
                <i className="fas fa-th-large"></i> {secondaryBtnText}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <span>Desplázate</span>
        <div className="mouse">
          <div className="mouse-wheel"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;