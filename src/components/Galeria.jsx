import React, { useState, useEffect } from 'react';

const galleryImages = [
  '/img/galeria/1.jpg',
  '/img/galeria/2.jpg',
  '/img/galeria/3.jpg',
  '/img/galeria/4.jpg',
  '/img/galeria/5.jpg',
  '/img/galeria/6.jpg',
  '/img/galeria/7.jpg'
];

const Galeria = () => {
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImg(null);
    };
    if (selectedImg) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImg]);

  return (
    <section id="galeria" className="galeria-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Imágenes</span>
          <h2 className="section-title">Galería</h2>
          <p className="section-description">Capturando los momentos más importantes de nuestra ciudad</p>
        </div>

        <div className="gallery-grid">
          {galleryImages.map((src, index) => (
            <div key={index} className="gallery-item" onClick={() => setSelectedImg(src)}>
              <img
                src={src}
                alt={`Galería León ${index + 1}`}
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/400?text=Galeria+${index + 1}`;
                }}
              />
              <div className="gallery-overlay">
                <i className="fas fa-search-plus"></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImg && (
        <div className="lightbox-modal" onClick={() => setSelectedImg(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <span className="lightbox-close" onClick={() => setSelectedImg(null)}>&times;</span>
            <img src={selectedImg} alt="Vista ampliada" />
          </div>
        </div>
      )}
    </section>
  );
};

export default Galeria;
