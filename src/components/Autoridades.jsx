import React, { useState } from 'react';

const autoridadesData = [
  {
    id: 1,
    nombre: 'Msc. Guissela Lacayo Medrano',
    cargo: 'Alcaldesa Municipal de León',
    badge: 'Alcaldesa',
    imagen: '/img/autoridades/alcaldesa.jpg',
    frase: '"Construyendo juntos una ciudad próspera, limpia y llena de cultura para todas las familias leonesas."',
    biografia: 'Magíster y servidora pública con amplia trayectoria dedicada a la gestión comunitaria, modernización de servicios públicos y preservación del patrimonio histórico de la ciudad universitaria de León.',
    responsabilidades: [
      'Dirección ejecutiva y estratégica del Gobierno Municipal.',
      'Promoción e impulso de megaproyectos de infraestructura y parques.',
      'Fomento del turismo sostenible, la cultura y la memoria histórica.',
      'Gestión de alianzas internacionales y cooperación para el municipio.'
    ],
    contacto: 'alcaldia@alcaldaleon.gob.ni'
  },
  {
    id: 2,
    nombre: 'Cro. Ariel Delgado Rojas',
    cargo: 'Vicealcalde Municipal',
    badge: 'Vicealcalde',
    imagen: '/img/autoridades/vicealcalde.jpg',
    frase: '"Comprometidos en el territorio, escuchando a nuestra gente y supervisando cada obra con transparencia."',
    biografia: 'Servidor público y líder comunitario con vasta experiencia en el seguimiento de obras viales, proyectos de desarrollo socio-productivo y fortalecimiento de las comarcas del municipio de León.',
    responsabilidades: [
      'Supervisión directa de proyectos de infraestructura y vialidad.',
      'Coordinación con gabinetes de la comunidad y líderes de barrios.',
      'Gestión de emergencias y prevención ante desastres naturales.',
      'Atención personalizada a ciudadanas y ciudadanos leoneses.'
    ],
    contacto: 'vicealcaldia@alcaldaleon.gob.ni'
  },
  {
    id: 3,
    nombre: 'Cra. Benita Vicenta Castillo',
    cargo: 'Secretaria del Consejo Municipal',
    badge: 'Secretaría del Consejo',
    imagen: '/img/autoridades/secretaria.jpg',
    frase: '"Transparencia y legalidad al servicio del desarrollo normativo de nuestro municipio."',
    biografia: 'Servidora pública y líder comunitaria encargada de la articulación legislativa municipal, registro de ordenanzas y facilitación democrática en las sesiones del Consejo Municipal.',
    responsabilidades: [
      'Custodia y redacción de ordenanzas, resoluciones y acuerdos municipales.',
      'Coordinación de las sesiones ordinarias y extraordinarias del Consejo.',
      'Recepción y canalización de iniciativas comunitarias y ciudadanas.',
      'Publicación y divulgación de informes de transparencia municipal.'
    ],
    contacto: 'secretariaconsejo@alcaldaleon.gob.ni'
  }
];

const Autoridades = () => {
  const [selectedAutoridad, setSelectedAutoridad] = useState(null);

  return (
    <section id="autoridades" className="autoridades-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Gobierno Municipal</span>
          <h2 className="section-title">Nuestras Autoridades</h2>
          <p className="section-description">
            Conoce al equipo de liderazgo comprometido con el desarrollo, la transparencia y el bienestar de las familias leonesas.
          </p>
        </div>

        <div className="row g-4 justify-content-center">
          {autoridadesData.map((autoridad) => (
            <div key={autoridad.id} className="col-lg-4 col-md-6">
              <div className="autoridad-card">
                <div className="autoridad-img-wrapper">
                  <img
                    src={autoridad.imagen}
                    alt={autoridad.nombre}
                    className="autoridad-img"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x500?text=Autoridad';
                    }}
                  />
                  <span className="autoridad-badge">{autoridad.badge}</span>
                </div>
                <div className="autoridad-body">
                  <h4 className="autoridad-nombre">{autoridad.nombre}</h4>
                  <h6 className="autoridad-cargo">{autoridad.cargo}</h6>
                  <p className="autoridad-frase">{autoridad.frase}</p>
                  <button
                    className="btn btn-outline-danger btn-sm w-100 mt-2"
                    onClick={() => setSelectedAutoridad(autoridad)}
                  >
                    <i className="fas fa-user-tie me-2"></i>Ver Biografía Completa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Biografía */}
      {selectedAutoridad && (
        <div className="autoridad-modal-backdrop" onClick={() => setSelectedAutoridad(null)}>
          <div className="autoridad-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="autoridad-modal-close" onClick={() => setSelectedAutoridad(null)}>
              &times;
            </button>
            <div className="row g-4 align-items-center">
              <div className="col-md-5 text-center">
                <img
                  src={selectedAutoridad.imagen}
                  alt={selectedAutoridad.nombre}
                  className="autoridad-modal-img"
                />
              </div>
              <div className="col-md-7">
                {/* Solución al solapamiento con posición estática/bloque clara */}
                <div className="mb-2">
                  <span className="badge bg-danger px-3 py-2">{selectedAutoridad.badge}</span>
                </div>
                <h3 className="fw-bold mb-1" style={{ color: 'var(--text-dark)' }}>{selectedAutoridad.nombre}</h3>
                <h6 className="text-danger fw-semibold mb-3">{selectedAutoridad.cargo}</h6>
                <p className="fst-italic text-muted small mb-3">{selectedAutoridad.frase}</p>

                <h6 className="fw-bold mb-2">Perfil y Biografía:</h6>
                <p className="small mb-3" style={{ opacity: 0.85, lineHeight: '1.6' }}>
                  {selectedAutoridad.biografia}
                </p>

                <h6 className="fw-bold mb-2">Principales Responsabilidades:</h6>
                <ul className="small ps-3 mb-4" style={{ opacity: 0.85 }}>
                  {selectedAutoridad.responsabilidades.map((resp, idx) => (
                    <li key={idx} className="mb-1">{resp}</li>
                  ))}
                </ul>

                <div className="d-flex align-items-center gap-2">
                  <a href={`mailto:${selectedAutoridad.contacto}`} className="btn btn-danger btn-sm px-3">
                    <i className="fas fa-envelope me-2"></i>Contactar Despacho
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Autoridades;