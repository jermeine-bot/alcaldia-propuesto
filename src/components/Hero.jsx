import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

// Lista enriquecida con sinónimos y palabras clave relacionadas
const searchSuggestionsList = [
  { title: 'Trámite de Alcantarillado y Agua', category: 'Servicios', link: '#servicios', synonyms: ['agua', 'alcantarillado', 'pago', 'agua potable'] },
  { title: 'Catedral de León (Patrimonio)', category: 'Turismo', link: '#turismo', synonyms: ['turismo', 'catedral', 'iglesia', 'visitar', 'patrimonio'] },
  { title: 'Noticias Municipales Recientes', category: 'Noticias', link: '#noticias', synonyms: ['noticias', 'actualidad', 'alcaldia', 'comunicados'] },
  { title: 'Proyectos de Desarrollo Urbano', category: 'Proyectos', link: '#proyectos', synonyms: ['proyectos', 'obras', 'desarrollo', 'construccion'] },
  { title: 'Horarios de Atención Ciudadana', category: 'Contacto', link: '#contacto', synonyms: ['contacto', 'horarios', 'telefono', 'atencion', 'ayuda'] },
  { title: 'Estadísticas de Población', category: 'Información', link: '#estadisticas', synonyms: ['estadisticas', 'poblacion', 'datos', 'cifras'] }
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

  // Filtrado avanzado con soporte de sinónimos
  const filteredSuggestions = searchSuggestionsList.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchTitle = item.title.toLowerCase().includes(term);
    const matchCategory = item.category.toLowerCase().includes(term);
    const matchSynonyms = item.synonyms?.some(syn => syn.toLowerCase().includes(term));
    return matchTitle || matchCategory || matchSynonyms;
  });

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
    <section id="hero" className="hero-section position-relative overflow-hidden w-100">
      <div className="hero-video-wrapper position-absolute w-100 h-100 top-0 start-0">
        <video autoPlay muted loop playsInline className="hero-video w-100 h-100 object-fit-cover" key={videoUrl}>
          <source src={videoUrl} type="video/mp4" />
          <img src={fallbackImg} alt="León Nicaragua" className="hero-fallback w-100 h-100 object-fit-cover" />
        </video>
        <div className="hero-overlay position-absolute w-100 h-100 top-0 start-0 bg-dark opacity-50"></div>
      </div>

      <div
        className="hero-content container position-relative d-flex align-items-center justify-content-center min-vh-100 py-5"
        style={{
          transform: `translateY(${offsetY * 0.35}px)`,
          opacity: Math.max(0, 1 - offsetY / 700),
          zIndex: 2
        }}
      >
        <div className="row hero-inner-row align-items-center justify-content-center text-center w-100 m-0">
          <div className="col-12 col-md-10 col-lg-9 col-xl-8 px-3">
            {badgeText && (
              <span className="badge bg-danger mb-3 px-3 py-2 text-uppercase letter-spacing-1 d-inline-block">
                {badgeText}
              </span>
            )}
            
            <h1 className="hero-title text-white fw-bold mb-3" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', lineHeight: '1.2' }}>
              {title}
            </h1>
            
            {/* Subtítulo cambiado a texto completamente blanco */}
            <p className="hero-subtitle text-white mb-4 mx-auto" style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)', maxWidth: '700px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {subtitle}
            </p>

            {/* MOTOR DE BÚSQUEDA CON DESPLAZAMIENTO HACIA ARRIBA (DROPUP) */}
            <div className="hero-search-container position-relative mb-4 mx-auto" ref={searchRef} style={{ maxWidth: '650px', width: '100%' }}>
              
              {/* LISTA DE SUGERENCIAS DESPLEGABLE HACIA ARRIBA */}
              {isFocused && (
                <div 
                  className="suggestions-dropdown position-absolute w-100 bg-white shadow-lg rounded-4 mb-2 overflow-hidden text-start start-0" 
                  style={{ 
                    zIndex: 1000, 
                    maxHeight: '260px', 
                    overflowY: 'auto',
                    bottom: '100%' // Fuerza a desplegarse hacia arriba del input
                  }}
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
                  placeholder="¿Qué buscas? (Trámites, turismo, agua...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  style={{ fontSize: '0.95rem', color: '#fff' }}
                />
              </div>

            </div>

            <div className="hero-buttons d-flex justify-content-center flex-wrap gap-2">
              <a href={primaryBtnLink} className="btn btn-outline-light btn-lg px-4 py-2">
                <i className="fas fa-compass me-2"></i> {primaryBtnText}
              </a>
              <a href={secondaryBtnLink} className="btn btn-primary btn-lg px-4 py-2">
                <i className="fas fa-th-large me-2"></i> {secondaryBtnText}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;