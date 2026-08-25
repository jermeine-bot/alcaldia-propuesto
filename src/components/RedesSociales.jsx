import React, { useState, useEffect, useRef } from 'react';

const instagramImages = [
  '/img/Redes sociales/instagram-1.jpg',
  '/img/Redes sociales/instagram-2.jpg',
  '/img/Redes sociales/instagram-3.jpg',
  '/img/Redes sociales/instagram-4.jpg',
  '/img/Redes sociales/instagram-5.jpg',
  '/img/Redes sociales/instagram-6.jpg'
];

const tiktokCaptures = [
  '/img/Redes sociales/captura de tiktok.png',
  '/img/Redes sociales/captura de tiktok2.png',
  '/img/Redes sociales/captura de tiktok3.png',
  '/img/Redes sociales/captura de tiktok4.png'
];

const facebookCaptures = [
  '/img/Redes sociales/captura de facebook.png',
  '/img/Redes sociales/captura de facebook1.png',
  '/img/Redes sociales/captura de facebook3.png',
  '/img/Redes sociales/captura de facebook4.png'
];

const socialStats = [
  { id: 1, icon: 'fa-facebook-f', target: 15234, label: 'Seguidores Facebook', color: '#1877F2' },
  { id: 2, icon: 'fa-instagram', target: 8756, label: 'Seguidores Instagram', color: '#E4405F' },
  { id: 3, icon: 'fa-tiktok', target: 12345, label: 'Seguidores TikTok', color: '#000000' },
  { id: 4, icon: 'fa-youtube', target: 5432, label: 'Suscriptores YouTube', color: '#FF0000' }
];

const AnimatedCounter = ({ target, duration = 2000, start = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing Function: easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [target, duration, start]);

  return <span>{count.toLocaleString()}</span>;
};

const RedesSociales = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="redes-sociales" ref={sectionRef} className="redes-section py-5 position-relative overflow-hidden">
      {/* Elementos Decorativos de Fondo */}
      <div className="social-bg-glow glow-1"></div>
      <div className="social-bg-glow glow-2"></div>

      <div className="container position-relative z-1">
        <div className="section-header text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-danger-subtle text-danger mb-3 font-mono small fw-semibold">
            <span className="live-dot-pulse"></span> COMUNIDAD DIGITAL EN VIVO
          </div>
          <h2 className="section-title">Síguenos en Redes Sociales</h2>
          <p className="section-description">
            Conéctate con la Alcaldía de León en todas nuestras plataformas oficiales para enterarte al instante de obras, noticias y eventos culturales.
          </p>
        </div>

        {/* CONTADORES ANIMADOS DE SEGUIDORES */}
        <div className="row g-4 mb-5">
          {socialStats.map((stat, idx) => (
            <div key={stat.id} className="col-lg-3 col-md-6 col-sm-6">
              <div 
                className={`social-animated-card ${isVisible ? 'card-animated-in' : ''}`}
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  <i className={`fab ${stat.icon}`}></i>
                </div>
                <div className="stat-info">
                  <div className="stat-counter-number" style={{ color: stat.color }}>
                    <AnimatedCounter target={stat.target} start={isVisible} />
                    <span className="plus-sign">+</span>
                  </div>
                  <span className="stat-counter-label">{stat.label}</span>
                </div>
                <div className="stat-card-badge">
                  <i className="fas fa-trending-up me-1"></i> +12% este mes
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTONES DE REDES DE ACCESO RÁPIDO */}
        <div className="row g-3 mb-5">
          <div className="col-12">
            <div className="social-buttons-wrapper">
              <a href="https://www.facebook.com/share/1EJ2g1UpjY/" target="_blank" rel="noreferrer" className="social-btn facebook">
                <i className="fab fa-facebook-f"></i>
                <span>Facebook</span>
                <i className="fas fa-arrow-right"></i>
              </a>
              <a href="https://www.instagram.com/alcaldia_leon" target="_blank" rel="noreferrer" className="social-btn instagram">
                <i className="fab fa-instagram"></i>
                <span>Instagram</span>
                <i className="fas fa-arrow-right"></i>
              </a>
              <a href="https://www.tiktok.com/@leonalcaldia?_r=1&_t=ZS-98pfIgmPYhg" target="_blank" rel="noreferrer" className="social-btn tiktok">
                <i className="fab fa-tiktok"></i>
                <span>TikTok</span>
                <i className="fas fa-arrow-right"></i>
              </a>
              <a href="https://www.youtube.com/@AlcaldiaLeon" target="_blank" rel="noreferrer" className="social-btn youtube">
                <i className="fab fa-youtube"></i>
                <span>YouTube</span>
                <i className="fas fa-arrow-right"></i>
              </a>
              <a href="https://twitter.com/Alcaldia_Leon" target="_blank" rel="noreferrer" className="social-btn twitter">
                <i className="fab fa-twitter"></i>
                <span>Twitter/X</span>
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        {/* FILTROS POR RED SOCIAL */}
        <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
          <button 
            className={`btn btn-sm rounded-pill px-4 ${activeTab === 'all' ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('all')}
          >
            <i className="fas fa-th-large me-2"></i>Todas las Redes
          </button>
          <button 
            className={`btn btn-sm rounded-pill px-4 ${activeTab === 'facebook' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('facebook')}
          >
            <i className="fab fa-facebook-f me-2"></i>Facebook
          </button>
          <button 
            className={`btn btn-sm rounded-pill px-4 ${activeTab === 'instagram' ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('instagram')}
          >
            <i className="fab fa-instagram me-2"></i>Instagram
          </button>
          <button 
            className={`btn btn-sm rounded-pill px-4 ${activeTab === 'tiktok' ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('tiktok')}
          >
            <i className="fab fa-tiktok me-2"></i>TikTok
          </button>
        </div>

        {/* TARJETAS SOCIAL MEDIA */}
        <div className="row g-4">
          {/* Facebook Card */}
          {(activeTab === 'all' || activeTab === 'facebook') && (
            <div className={activeTab === 'facebook' ? 'col-12' : 'col-lg-4'}>
              <div className="social-card facebook-card">
                <div className="social-card-header">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fab fa-facebook-f"></i>
                    <h5 className="mb-0">Facebook</h5>
                  </div>
                  <span className="social-badge badge-fb"><i className="fas fa-check-circle me-1"></i>Oficial</span>
                </div>
                <div className="social-card-body facebook-card-body">
                  <div className="facebook-gallery">
                    {facebookCaptures.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="facebook-gallery-item clickable-media"
                        onClick={() => setSelectedImage({ src: img, title: `Publicación Facebook #${idx + 1}` })}
                      >
                        <img src={img} alt={`Facebook ${idx + 1}`} loading="lazy" />
                        <div className="media-hover-overlay">
                          <i className="fas fa-search-plus"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="facebook-profile mt-3">
                    <i className="fab fa-facebook-f me-2"></i>
                    <h6 className="fw-bold mb-0">@AlcaldiaLeon</h6>
                  </div>
                  <p className="text-muted small mb-0">Transmisiones en directo, comunicados oficiales y avisos comunitarios.</p>
                </div>
                <div className="social-card-footer">
                  <a href="https://www.facebook.com/share/1EJ2g1UpjY/" target="_blank" rel="noreferrer" className="social-link-btn">
                    Ir a Facebook <i className="fas fa-external-link-alt ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Instagram Card */}
          {(activeTab === 'all' || activeTab === 'instagram') && (
            <div className={activeTab === 'instagram' ? 'col-12' : 'col-lg-4'}>
              <div className="social-card instagram-card">
                <div className="social-card-header">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fab fa-instagram"></i>
                    <h5 className="mb-0">Instagram</h5>
                  </div>
                  <span className="social-badge badge-ig"><i className="fas fa-camera me-1"></i>Fotos</span>
                </div>
                <div className="social-card-body">
                  <div className="instagram-grid">
                    {instagramImages.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="instagram-item clickable-media"
                        onClick={() => setSelectedImage({ src: img, title: `Galería Instagram #${idx + 1}` })}
                      >
                        <img
                          src={img}
                          alt={`Instagram ${idx + 1}`}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=IG'; }}
                        />
                        <div className="instagram-overlay">
                          <i className="fas fa-heart me-1"></i>
                          <span>Ver</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="social-card-footer">
                  <a href="https://www.instagram.com/alcaldia_leon" target="_blank" rel="noreferrer" className="social-link-btn">
                    Ir a Instagram <i className="fas fa-external-link-alt ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TikTok Card */}
          {(activeTab === 'all' || activeTab === 'tiktok') && (
            <div className={activeTab === 'tiktok' ? 'col-12' : 'col-lg-4'}>
              <div className="social-card tiktok-card">
                <div className="social-card-header">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fab fa-tiktok"></i>
                    <h5 className="mb-0">TikTok</h5>
                  </div>
                  <span className="social-badge badge-tt"><i className="fas fa-video me-1"></i>Videos</span>
                </div>
                <div className="social-card-body tiktok-card-body">
                  <div className="tiktok-gallery">
                    {tiktokCaptures.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="tiktok-gallery-item clickable-media"
                        onClick={() => setSelectedImage({ src: img, title: `Video TikTok #${idx + 1}` })}
                      >
                        <img src={img} alt={`TikTok ${idx + 1}`} loading="lazy" />
                        <div className="media-hover-overlay">
                          <i className="fas fa-play"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="tiktok-profile mt-3">
                    <i className="fab fa-tiktok me-2"></i>
                    <h6 className="fw-bold mb-0">@alcaldia_leon</h6>
                  </div>
                  <p className="text-muted small mb-0">Reportajes dinámicos, eventos culturales y resumen de obras.</p>
                </div>
                <div className="social-card-footer">
                  <a href="https://www.tiktok.com/@leonalcaldia?_r=1&_t=ZS-98pfIgmPYhg" target="_blank" rel="noreferrer" className="social-link-btn">
                    Ir a TikTok <i className="fas fa-external-link-alt ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE PREVISUALIZACIÓN DE IMAGEN */}
      {selectedImage && (
        <div className="social-media-modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="social-media-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="text-center">
              <img src={selectedImage.src} alt={selectedImage.title} className="img-fluid rounded shadow-lg" />
              <h6 className="mt-3 text-white">{selectedImage.title}</h6>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RedesSociales;

