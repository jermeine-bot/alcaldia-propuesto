import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { apiService } from '../services/apiService';

const Noticias = () => {
  const { data: noticias = [] } = useQuery({
    queryKey: ['noticias'],
    queryFn: apiService.getNoticias
  });

  const publishedNoticias = noticias.filter((n) => n.status !== 'draft');

  return (
    <section id="noticias" className="noticias-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Actualidad</span>
          <h2 className="section-title">Últimas Noticias</h2>
          <p className="section-description">Mantente informado sobre los acontecimientos de nuestra ciudad</p>
        </div>

        {publishedNoticias.length === 0 ? (
          <div className="text-center text-muted py-4">No hay noticias publicadas en este momento.</div>
        ) : (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 30 }
            }}
            className="noticias-swiper"
          >
            {publishedNoticias.map((item) => {
              // Obtenemos el link ingresado (soporta 'linkUrl' o 'url')
              const targetUrl = item.linkUrl || item.url || '#contacto';
              const isExternal = targetUrl.startsWith('http://') || targetUrl.startsWith('https://');

              return (
                <SwiperSlide key={item.id}>
                  <div className="noticia-card h-100 d-flex flex-column">
                    <img
                      src={item.image || item.img}
                      alt={item.title}
                      className="noticia-img"
                      style={{ objectFit: 'cover', height: '200px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/img/noticias/noticia1.jpg';
                      }}
                    />
                    <div className="noticia-body d-flex flex-column flex-grow-1">
                      <span className="noticia-date">{item.date || 'Reciente'}</span>
                      <h5 className="mt-1">{item.title}</h5>
                      <p className="flex-grow-1">{item.summary || item.desc}</p>
                      
                      <div className="mt-auto pt-2">
                        <a
                          href={targetUrl}
                          target={isExternal ? '_blank' : '_self'}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          className="noticia-link d-inline-flex align-items-center gap-1"
                        >
                          Leer más <i className="fas fa-arrow-right ms-1"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default Noticias;