import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  
  const { data: noticias = [], isLoading } = useQuery({
    queryKey: ['noticias'],
    queryFn: apiService.getNoticias
  });

  // Procesar, filtrar y ordenar las noticias para asegurar que las más recientes queden arriba
  const recentNoticias = useMemo(() => {
    return noticias
      .filter((n) => n.status !== 'draft')
      .sort((a, b) => {
        // Extraer marca de tiempo probando campos comunes de fecha del CMS
        const dateA = new Date(a.published_at || a.date || a.createdAt || a.fecha || 0).getTime();
        const dateB = new Date(b.published_at || b.date || b.createdAt || b.fecha || 0).getTime();
        
        // Si no hay fechas válidas, mantener el orden por ID decreciente (asumiendo IDs numéricos auto-incrementables)
        if (isNaN(dateA) || isNaN(dateB) || dateA === dateB) {
          return (b.id || 0) - (a.id || 0);
        }
        
        return dateB - dateA; // Orden descendente (más reciente primero)
      })
      .slice(0, 8); // Tomamos únicamente las 8 más recientes
  }, [noticias]);

  const hasMoreNews = noticias.filter((n) => n.status !== 'draft').length > 0;

  return (
    <section id="noticias" className="noticias-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Actualidad</span>
          <h2 className="section-title">Últimas Noticias</h2>
          <p className="section-description">Mantente informado sobre los acontecimientos de nuestra ciudad</p>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <p className="text-muted small mt-2">Cargando últimas noticias...</p>
          </div>
        ) : recentNoticias.length === 0 ? (
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
            className="noticias-swiper pb-5"
          >
            {/* Renderizamos las 8 noticias más recientes ordenadas */}
            {recentNoticias.map((item) => {
              const rawLink = item.linkUrl || item.url || item.url_externa;
              const hasLink = typeof rawLink === 'string' && rawLink.trim() !== '';
              const targetUrl = hasLink ? formatUrl(rawLink) : '#noticias';
              const isExternal = hasLink && /^https?:\/\//i.test(targetUrl);
              const openDetail = (event) => {
                if (event) event.preventDefault();
                setSelectedNoticia(item);
              };

              return (
                <SwiperSlide key={item.id} className="h-auto">
                  <div className="noticia-card h-100 d-flex flex-column shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                    <a
                      href={targetUrl}
                      target={isExternal ? '_blank' : '_self'}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="d-block overflow-hidden text-decoration-none"
                      title={item.title || item.titulo}
                      onClick={hasLink ? undefined : openDetail}
                    >
                      <img
                        src={item.image || item.img || item.image_url}
                        alt={item.title || item.titulo}
                        className="noticia-img w-100"
                        style={{ objectFit: 'cover', height: '210px' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/img/noticias/noticia1.jpg';
                        }}
                      />
                    </a>

                    <div className="noticia-body d-flex flex-column flex-grow-1 p-4">
                      <span className="noticia-date text-danger small fw-semibold mb-2 d-block">
                        <i className="far fa-calendar-alt me-1"></i> {item.date || item.published_at || item.fecha || 'Reciente'}
                      </span>
                      
                      <h5 className="mt-1 mb-2">
                        <a
                          href={targetUrl}
                          target={isExternal ? '_blank' : '_self'}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          className="text-dark text-decoration-none fw-bold"
                          onClick={hasLink ? undefined : openDetail}
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '1.05rem',
                            lineHeight: '1.4'
                          }}
                        >
                          {item.title || item.titulo}
                        </a>
                      </h5>

                      <p 
                        className="text-muted small mb-4 flex-grow-1"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.summary || item.desc || item.resumen}
                      </p>

                      <div className="mt-auto pt-2 border-top">
                        <button
                          type="button"
                          className="noticia-link btn btn-link p-0 border-0 d-inline-flex align-items-center gap-1 text-danger fw-semibold text-decoration-none"
                          onClick={openDetail}
                        >
                          Leer más <i className="fas fa-arrow-right ms-1 small"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}

            {/* TARJETA NÚMERO 9: ENLACE ESPECIAL "VER MÁS NOTICIAS" */}
            {hasMoreNews && (
              <SwiperSlide key="ver-mas-card" className="h-auto">
                <div className="noticia-card h-100 d-flex flex-column justify-content-center align-items-center text-center p-4 bg-danger text-white rounded-4 shadow-sm">
                  <div className="mb-3">
                    <i className="fas fa-newspaper fa-3x text-white-50"></i>
                  </div>
                  <h4 className="fw-bold mb-3 text-white">¿Quieres ver más noticias?</h4>
                  <p className="small text-white-50 mb-4">
                    Explora el archivo completo con todas las publicaciones, comunicados y eventos de la Alcaldía de León.
                  </p>
                  <Link
                    to="/noticias"
                    className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-danger d-inline-flex align-items-center gap-2 shadow-sm"
                  >
                    Ver todas las noticias
                    <i className="fas fa-arrow-right small"></i>
                  </Link>
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        )}

        <ContentModal
          open={!!selectedNoticia}
          onClose={() => setSelectedNoticia(null)}
          image={selectedNoticia ? (selectedNoticia.image || selectedNoticia.img || selectedNoticia.image_url) : ''}
          fallbackImage="/img/noticias/noticia1.jpg"
          eyebrow={selectedNoticia?.category || selectedNoticia?.categoria}
          meta={selectedNoticia?.date || selectedNoticia?.published_at || selectedNoticia?.fecha}
          title={selectedNoticia?.title || selectedNoticia?.titulo}
          description={selectedNoticia?.summary || selectedNoticia?.desc || selectedNoticia?.resumen}
          content={selectedNoticia?.content || selectedNoticia?.contenido}
          link={selectedNoticia?.linkUrl || selectedNoticia?.url || selectedNoticia?.url_externa}
          linkText="Abrir enlace original"
        />
      </div>
    </section>
  );
};

export default Noticias;