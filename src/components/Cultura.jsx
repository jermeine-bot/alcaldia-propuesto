import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

const Cultura = () => {
  const { data: cultura = [] } = useQuery({
    queryKey: ['cultura'],
    queryFn: apiService.getCultura
  });

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
          <div className="row g-4">
            {cultura.map((item) => (
              <div key={item.id} className="col-lg-4 col-md-6">
                <div className="cultura-card">
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
                  <a href="#contacto" className="cultura-link">Conocer más</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Cultura;
