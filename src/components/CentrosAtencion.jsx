import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { initialCentrosAtencionData } from '../services/initialData';

const CentrosAtencion = () => {
  const { data: centrosAtencion = initialCentrosAtencionData } = useQuery({
    queryKey: ['centros-atencion'],
    queryFn: apiService.getCentrosAtencion,
    staleTime: 0
  });

  return (
    <section id="centros-atencion" className="centros-atencion-section py-5">
    <div className="container">
      <div className="section-header text-center mb-5">
        <span className="section-subtitle">Servicios municipales</span>
        <h2 className="section-title">Centros de Atención Tributaria</h2>
        <p className="section-description">
          Encuentra nuestros centros de atención y consulta su ubicación en Google Maps.
        </p>
      </div>

      <div className="row g-4">
        {centrosAtencion.map((centro) => (
          <div key={centro.id} className="col-lg-4 col-md-6">
            <article className="centro-atencion-card h-100">
              <img
                className="centro-atencion-image"
                src={centro.image}
                alt={`Foto ilustrativa de ${centro.title}`}
                loading="lazy"
              />
              <div className="centro-atencion-content">
                <span className="centro-atencion-label">{centro.serviceLabel || 'Atención tributaria'}</span>
                <h3>{centro.title}</h3>
                <p>{centro.description}</p>
                <div className="centro-atencion-location">
                  <i className="fas fa-location-dot" aria-hidden="true"></i>
                  <span>
                    {centro.coordinates
                      ? `Coordenadas: ${centro.coordinates}`
                      : 'Ubicación en Google Maps; coordenadas por confirmar'}
                  </span>
                </div>
                <a
                  className="centro-atencion-map-link"
                  href={centro.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Ver ubicación de ${centro.title} en Google Maps`}
                >
                  Ver ubicación en Google Maps
                  <i className="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
                </a>
                <small className="centro-atencion-image-note">Fotografía ilustrativa</small>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
    </section>
  );
};

export default CentrosAtencion;
