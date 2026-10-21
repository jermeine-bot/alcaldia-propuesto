import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { apiService } from '../services/apiService';
import ContentModal from './ContentModal';

const formatUrl = (url) => {
  if (!url || typeof url !== 'string') return '#contacto';
  const trimmed = url.trim();
  if (!trimmed) return '#contacto';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const Noticias = () => {
  const [selectedNoticia, setSelectedNoticia] = useState(null);
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
              const rawLink = item.linkUrl || item.url || item.url_externa;
              const hasLink = typeof rawLink === 'string' && rawLink.trim() !== '';
              const targetUrl = hasLink ? formatUrl(rawLink) : '#noticias';
              const isExternal = hasLink && /^https?:\/\//i.test(targetUrl);
              const openDetail = (event) => {
                if (event) event.preventDefault();
                setSelectedNoticia(item);
              };

              return (
                <SwiperSlide key={item.id}>
                  <div className="noticia-card h-100 d-flex flex-column">
                    <a
                      href={targetUrl}
                      target={isExternal ? '_blank' : '_self'}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="d-block overflow-hidden text-decoration-none"
                      title={item.title}
                      onClick={hasLink ? undefined : openDetail}
                    >
                      <img
                        src={item.image || item.img}
                        alt={item.title}
                        className="noticia-img"
                        style={{ objectFit: 'cover', height: '200px', width: '100%' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/img/noticias/noticia1.jpg';
                        }}
                      />
                    </a>
                    <div className="noticia-body d-flex flex-column flex-grow-1">
                      <span className="noticia-date">{item.date || 'Reciente'}</span>
                      <h5 className="mt-1">
                        <a
                          href={targetUrl}
                          target={isExternal ? '_blank' : '_self'}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          className="text-dark text-decoration-none"
                          onClick={hasLink ? undefined : openDetail}
                        >
                          {item.title}
                        </a>
                      </h5>
                      <p className="flex-grow-1">{item.summary || item.desc}</p>

                      <div className="mt-auto pt-2">
                        <button
                          type="button"
                          className="noticia-link btn btn-link p-0 border-0 d-inline-flex align-items-center gap-1"
                          onClick={openDetail}
                        >
                          Ver más <i className="fas fa-arrow-right ms-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}

        <ContentModal
          open={!!selectedNoticia}
          onClose={() => setSelectedNoticia(null)}
          image={selectedNoticia ? (selectedNoticia.image || selectedNoticia.img) : ''}
          fallbackImage="/img/noticias/noticia1.jpg"
          eyebrow={selectedNoticia?.category}
          meta={selectedNoticia?.date}
          title={selectedNoticia?.title}
          description={selectedNoticia?.summary || selectedNoticia?.desc}
          content={selectedNoticia?.content}
          link={selectedNoticia?.linkUrl || selectedNoticia?.url || selectedNoticia?.url_externa}
          linkText="Abrir enlace original"
        />
      </div>
    </section>
  );
};

export default Noticias;