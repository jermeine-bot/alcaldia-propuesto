import React, { useEffect, useState } from 'react';

const Hero = () => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.pageYOffset);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="hero" className="hero-section">
      <div className="hero-video-wrapper">
        <video autoPlay muted loop playsInline className="hero-video">
          <source src="/video/leon nicaragua vista de un dron.mp4" type="video/mp4" />
          <img src="/img/hero-bg.jpg" alt="León Nicaragua" className="hero-fallback" />
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
           
            <h1 className="hero-title">
              Bienvenidos a la Alcaldía Municipal de León
            </h1>
            <p className="hero-subtitle">
              Construyendo juntos el futuro de nuestra ciudad, con transparencia,
              innovación y compromiso con cada leonés.
            </p>
            <div className="hero-buttons">
              <a href="#turismo" className="btn btn-outline-light btn-lg">
                <i className="fas fa-compass"></i> Conoce León
              </a>
              <a href="#servicios" className="btn btn-primary btn-lg">
                <i className="fas fa-th-large"></i> Servicios Rápidos
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
