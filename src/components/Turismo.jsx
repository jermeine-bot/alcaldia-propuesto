import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { apiService } from '../services/apiService';

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
              const targetUrl = cleanLink || '#contacto';
              const isExternal = cleanLink ? /^https?:\/\//i.test(cleanLink) : false;

              return (
                <SwiperSlide key={item.id}>
                  <a
                    href={targetUrl}
                    target={isExternal ? '_blank' : '_self'}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="turismo-slide text-decoration-none d-block cursor-pointer"
                    title={item.title}
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
                      <span className="badge bg-danger mt-2 text-white px-3 py-1 rounded-pill small d-inline-flex align-items-center gap-1">
                        {cleanLink ? 'Conocer más' : 'Ver Destino'} <i className={isExternal ? "fas fa-external-link-alt ms-1" : "fas fa-arrow-right ms-1"}></i>
                      </span>
                    </div>
                  </a>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default Turismo;