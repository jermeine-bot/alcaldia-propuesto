import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { apiService } from '../services/apiService';

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
              // Obtiene el enlace directamente desde la base de datos (linkUrl o url)
              const targetUrl = item.linkUrl || item.url;
              const isExternal = targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'));

              const CardWrapper = targetUrl ? 'a' : 'div';
              const wrapperProps = targetUrl ? {
                href: targetUrl,
                target: isExternal ? '_blank' : '_self',
                rel: isExternal ? 'noopener noreferrer' : undefined,
                className: 'turismo-slide text-decoration-none d-block cursor-pointer'
              } : {
                className: 'turismo-slide'
              };

              return (
                <SwiperSlide key={item.id}>
                  <CardWrapper {...wrapperProps}>
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
                      {targetUrl && (
                        <span className="badge bg-danger mt-2 text-white px-3 py-1 rounded-pill small">
                          Ver Destino <i className="fas fa-external-link-alt ms-1"></i>
                        </span>
                      )}
                    </div>
                  </CardWrapper>
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