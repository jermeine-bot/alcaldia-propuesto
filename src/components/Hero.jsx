import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

const Hero = () => {
  const [offsetY, setOffsetY] = useState(0);

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
        <div className="row hero-inner-row align-items-center">
          <div className="col-lg-8">
            {badgeText && (
              <span className="badge bg-danger mb-2 px-3 py-2 text-uppercase letter-spacing-1">
                {badgeText}
              </span>
            )}
            <h1 className="hero-title">{title}</h1>
            <p className="hero-subtitle">{subtitle}</p>
            <div className="hero-buttons">
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
