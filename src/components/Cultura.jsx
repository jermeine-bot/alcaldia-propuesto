import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

const FALLBACK_IMAGE = '/img/noticias/festival de la poseia.jpg';
const HOME_LIMIT = 3;

const Cultura = () => {
  const { data: cultura = [] } = useQuery({
    queryKey: ['cultura'],
    queryFn: apiService.getCultura
  });

  const visibleCultura = cultura.slice(0, HOME_LIMIT);
  const hasMoreCultura = cultura.length > HOME_LIMIT;

  return (
    <section id="cultura" className="cultura-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Tradición</span>
          <h2 className="section-title">Cultura y Eventos</h2>
          <p className="section-description">Vive la riqueza cultural de nuestra ciudad</p>
        </div>

        {cultura.length === 0 ? (
          <div className="text-center text-muted py-4">No hay eventos culturales registrados.</div>
        ) : (
          <>
            <div className="row g-4">
              {visibleCultura.map((item) => {
                const image = item.image_url || item.image || item.img || FALLBACK_IMAGE;

                return (
                  <div key={item.id} className="col-lg-4 col-md-6">
                    <div className="cultura-card">
                      <img
                        src={image}
                        alt={item.title || 'Evento cultural'}
                        className="cultura-card-image"
                        loading="lazy"
                        onError={(e) => {
                          if (e.currentTarget.src !== window.location.origin + FALLBACK_IMAGE) {
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }
                        }}
                      />
                      <div className="cultura-icon">
                        <i className={`fas ${item.icon || 'fa-star'}`}></i>
                      </div>
                      <h4>{item.title}</h4>
                      <p>{item.desc || item.summary}</p>
                      {item.event_date && (
                        <div className="small text-danger fw-semibold mb-2">
                          <i className="far fa-calendar-alt me-1"></i> {item.event_date}
                        </div>
                      )}
                      {item.event_time && (
                        <div className="small text-muted mb-1">
                          <i className="far fa-clock me-1"></i> {item.event_time}
                        </div>
                      )}
                      {item.location && (
                        <div className="small text-muted">
                          <i className="fas fa-map-marker-alt me-1"></i> {item.location}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BOTÓN INFERIOR: VER MÁS FESTIVIDADES */}
           {hasMoreCultura && (
  <div className="text-center mt-5">
    <Link
      to="/cultura"
      className="btn btn-danger rounded-pill px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
    >
      Ver más festividades
      <i className="fas fa-arrow-right small"></i>
    </Link>
  </div>
)}
          </>
        )}
      </div>
    </section>
  );
};

export default Cultura;