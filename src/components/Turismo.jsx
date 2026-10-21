import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { apiService } from '../services/apiService';
import ContentModal from './ContentModal';

const formatUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const Turismo = () => {
  const [selectedTurismo, setSelectedTurismo] = useState(null);
  const { data: turismo = [] } = useQuery({
    queryKey: ['turismo'],
    queryFn: apiService.getTurismo
  });

  return (
    <section id="turismo" className="turismo-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Destinos</span>
          <h2 className="section-title">Descubre León</h2>
          <p className="section-description">Una ciudad llena de historia, cultura y belleza natural</p>
        </div>

        {turismo.length === 0 ? (
          <div className="text-center text-muted py-4">No hay destinos turísticos disponibles.</div>
        ) : (
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            loop={turismo.length > 1}
            navigation
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 30 }
            }}
            className="turismo-swiper"
          >
            {turismo.map((item) => {
              const rawLink = item.linkUrl || item.url;
              const cleanLink = formatUrl(rawLink);
              const isExternal = /^https?:\/\//i.test(cleanLink);
              const openDetail = () => setSelectedTurismo(item);

              return (
                <SwiperSlide key={item.id}>
                  <div
                    className="turismo-slide text-decoration-none d-block cursor-pointer"
                    title={item.title}
                    role="button"
                    tabIndex={0}
                    onClick={openDetail}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openDetail();
                      }
                    }}
                  >
                    <img
                      src={item.image || item.img}
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/img/turismo/catedral.jpg';
                      }}
                    />
                    <div className="turismo-overlay">
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                      <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                        <span className="badge bg-danger text-white px-3 py-1 rounded-pill small d-inline-flex align-items-center gap-1">
                          Leer reseña <i className="fas fa-book-open ms-1"></i>
                        </span>
                        {cleanLink && (
                          <a
                            href={cleanLink}
                            target={isExternal ? '_blank' : '_self'}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            className="badge bg-dark text-white px-3 py-1 rounded-pill small text-decoration-none d-inline-flex align-items-center gap-1"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {isExternal ? 'Sitio oficial' : 'Conocer más'}
                            <i className={isExternal ? 'fas fa-external-link-alt ms-1' : 'fas fa-arrow-right ms-1'}></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}

        <ContentModal
          open={!!selectedTurismo}
          onClose={() => setSelectedTurismo(null)}
          image={selectedTurismo ? (selectedTurismo.image || selectedTurismo.img) : ''}
          fallbackImage="/img/turismo/catedral.jpg"
          eyebrow={selectedTurismo?.category}
          meta={selectedTurismo?.location}
          title={selectedTurismo?.title}
          description={selectedTurismo?.desc}
          content={selectedTurismo?.content}
          link={selectedTurismo?.linkUrl || selectedTurismo?.url}
          linkText="Visitar sitio"
        />
      </div>
    </section>
  );
};

export default Turismo;