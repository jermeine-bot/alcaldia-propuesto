import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { initialRedesSocialesData } from '../services/initialData';

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
  const queryClient = useQueryClient();
  const { data: socialData = initialRedesSocialesData } = useQuery({
    queryKey: ['redes-sociales'],
    queryFn: apiService.getRedesSociales,
    staleTime: 0
  });

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'alcaldia_leon_redes_sociales') {
        queryClient.invalidateQueries({ queryKey: ['redes-sociales'] });
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [queryClient]);

  const platforms = socialData.platforms;
  const getPlatform = (id) => platforms.find((platform) => platform.id === id) || initialRedesSocialesData.platforms.find((platform) => platform.id === id);
  const instagramImages = getPlatform('instagram').images.filter(Boolean);
  const tiktokCaptures = getPlatform('tiktok').images.filter(Boolean);
  const facebookCaptures = getPlatform('facebook').images.filter(Boolean);
  const socialStats = platforms.filter((platform) => platform.statTarget !== null && platform.statTarget !== '').map((platform) => ({
    id: platform.id,
    icon: platform.icon,
    target: Number(platform.statTarget) || 0,
    label: platform.statLabel,
    color: platform.color
  }));

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
            <span className="live-dot-pulse"></span> {socialData.eyebrow}
          </div>
          <h2 className="section-title">{socialData.title}</h2>
          <p className="section-description">{socialData.description}</p>
        </div>

        {/* CONTADORES ANIMADOS DE SEGUIDORES */}
        <div className="row g-4 mb-5">
          {socialStats.map((stat, idx) => (
            <div key={stat.id} className="col-lg-3 col-md-6 col-sm-6 col-6">
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
              {platforms.map((platform) => (
                <a key={platform.id} href={platform.url} target="_blank" rel="noreferrer" className={`social-btn ${platform.buttonClass}`}>
                  <i className={`fab ${platform.icon}`}></i>
                  <span>{platform.name}</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
              ))}
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

        {/* TARJETAS SOCIAL MEDIA (Forzadas a col-6 para 2 columnas en móviles y tablets) */}
        <div className="row g-3 g-md-4">
          {/* Facebook Card */}
          {(activeTab === 'all' || activeTab === 'facebook') && (
            <div className={activeTab === 'facebook' ? 'col-12' : 'col-lg-4 col-md-6 col-6'}>
              <div className="social-card facebook-card h-100">
                <div className="social-card-header">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fab fa-facebook-f"></i>
                    <h5 className="mb-0 text-truncate">{getPlatform('facebook').name}</h5>
                  </div>
                  <span className="social-badge badge-fb d-none d-sm-inline-block"><i className="fas fa-check-circle me-1"></i>Oficial</span>
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
                    <h6 className="fw-bold mb-0 text-truncate">{getPlatform('facebook').handle}</h6>
                  </div>
                  <p className="text-muted small mb-0 d-none d-sm-block">{getPlatform('facebook').profileDescription}</p>
                </div>
                <div className="social-card-footer">
                  <a href={getPlatform('facebook').url} target="_blank" rel="noreferrer" className="social-link-btn">
                    Ir a {getPlatform('facebook').name} <i className="fas fa-external-link-alt ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Instagram Card */}
          {(activeTab === 'all' || activeTab === 'instagram') && (
            <div className={activeTab === 'instagram' ? 'col-12' : 'col-lg-4 col-md-6 col-6'}>
              <div className="social-card instagram-card h-100">
                <div className="social-card-header">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fab fa-instagram"></i>
                    <h5 className="mb-0 text-truncate">{getPlatform('instagram').name}</h5>
                  </div>
                  <span className="social-badge badge-ig d-none d-sm-inline-block"><i className="fas fa-camera me-1"></i>Fotos</span>
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
                  <div className="instagram-profile mt-3">
                    <i className="fab fa-instagram me-2"></i>
                    <h6 className="fw-bold mb-0 text-truncate">{getPlatform('instagram').handle}</h6>
                  </div>
                </div>
                <div className="social-card-footer">
                  <a href={getPlatform('instagram').url} target="_blank" rel="noreferrer" className="social-link-btn">
                    Ir a {getPlatform('instagram').name} <i className="fas fa-external-link-alt ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TikTok Card */}
          {(activeTab === 'all' || activeTab === 'tiktok') && (
            <div className={activeTab === 'tiktok' ? 'col-12' : 'col-lg-4 col-md-6 col-6'}>
              <div className="social-card tiktok-card h-100">
                <div className="social-card-header">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fab fa-tiktok"></i>
                    <h5 className="mb-0 text-truncate">{getPlatform('tiktok').name}</h5>
                  </div>
                  <span className="social-badge badge-tt d-none d-sm-inline-block"><i className="fas fa-video me-1"></i>Videos</span>
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
                    <h6 className="fw-bold mb-0 text-truncate">{getPlatform('tiktok').handle}</h6>
                  </div>
                  <p className="text-muted small mb-0 d-none d-sm-block">{getPlatform('tiktok').profileDescription}</p>
                </div>
                <div className="social-card-footer">
                  <a href={getPlatform('tiktok').url} target="_blank" rel="noreferrer" className="social-link-btn">
                    Ir a {getPlatform('tiktok').name} <i className="fas fa-external-link-alt ms-1"></i>
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