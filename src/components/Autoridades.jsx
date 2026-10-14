import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

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
    contacto: 'despachoalcaldeleon@gmail.com',
    telefono: 23113780
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
    contacto: 'despachoalcaldeleon@gmail.com',
    telefono: 23113780
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
    contacto: 'despachoalcaldeleon@gmail.com',
    telefono: 23113780
  }
];

const Autoridades = () => {
  const [selectedAutoridad, setSelectedAutoridad] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Bloquear el scroll del body cuando algún modal esté abierto
  useEffect(() => {
    if (selectedAutoridad || showContactModal) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setShowContactModal(false);
          setSelectedAutoridad(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedAutoridad, showContactModal]);

  // Contenido del modal principal de biografía
  const modalContent = selectedAutoridad && (
    <div 
      className="autoridad-modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 p-md-4"
      style={{
        backgroundColor: 'rgba(11, 37, 69, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        overflowY: 'auto'
      }}
      onClick={() => setSelectedAutoridad(null)}
    >
      <div 
        className="autoridad-modal-card bg-white rounded-5 shadow-lg p-4 p-md-5 w-100 position-relative d-flex flex-column border-0" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          .autoridad-modal-card::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Botón de Cierre Superior (X) */}
        <button 
          className="btn-close-custom btn rounded-circle border-0 text-secondary bg-light d-flex align-items-center justify-content-center position-absolute" 
          onClick={() => setSelectedAutoridad(null)}
          aria-label="Cerrar modal"
          style={{ width: '40px', height: '40px', top: '20px', right: '20px', zIndex: 2 }}
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="row g-4 align-items-center">
          <div className="col-md-5 text-center">
            <img
              src={selectedAutoridad.imagen}
              alt={selectedAutoridad.nombre}
              className="autoridad-modal-img img-fluid rounded-4 shadow-sm object-fit-cover"
              style={{ maxHeight: '350px', width: '100%' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x500?text=Autoridad';
              }}
            />
          </div>
          <div className="col-md-7 text-start">
            <div className="mb-2">
              <span className="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill fw-bold text-uppercase small">
                {selectedAutoridad.badge}
              </span>
            </div>
            <h3 className="h4 fw-bold mb-1 text-dark">{selectedAutoridad.nombre}</h3>
            <h6 className="text-danger fw-semibold mb-3">{selectedAutoridad.cargo}</h6>
            <p className="fst-italic text-muted small mb-3">{selectedAutoridad.frase}</p>

            <h6 className="fw-bold mb-2 text-dark small text-uppercase letter-spacing-1">Perfil y Biografía:</h6>
            <p className="small mb-3 text-secondary" style={{ lineHeight: '1.6' }}>
              {selectedAutoridad.biografia}
            </p>

            <h6 className="fw-bold mb-2 text-dark small text-uppercase letter-spacing-1">Principales Responsabilidades:</h6>
            <ul className="small ps-3 mb-4 text-secondary">
              {selectedAutoridad.responsabilidades.map((resp, idx) => (
                <li key={idx} className="mb-1">{resp}</li>
              ))}
            </ul>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top gap-3 flex-wrap">
              <button 
                type="button" 
                className="btn btn-danger btn-sm px-4 rounded-pill fw-semibold"
                onClick={() => setShowContactModal(true)}
              >
                <i className="fas fa-envelope me-2"></i>Contactar Despacho
              </button>
              <button 
                className="btn btn-light btn-sm px-4 rounded-pill fw-semibold text-secondary border"
                onClick={() => setSelectedAutoridad(null)}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Contenido del nuevo modal secundario para Contactar
  const contactModalContent = selectedAutoridad && showContactModal && (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 100000
      }}
      onClick={() => setShowContactModal(false)}
    >
      <div 
        className="bg-white rounded-4 shadow-lg p-4 w-100 position-relative text-center border-0" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '450px' }}
      >
        <button 
          className="btn-close btn rounded-circle position-absolute top-0 end-0 m-3" 
          onClick={() => setShowContactModal(false)}
          aria-label="Cerrar modal contacto"
        ></button>

        <div className="mb-3 text-danger pt-2">
          <i className="fas fa-headset fa-3x"></i>
        </div>

        <h4 className="fw-bold text-dark mb-1">Contacto Directo</h4>
        <p className="text-muted small mb-4">{selectedAutoridad.cargo}</p>

        <div className="card bg-light border-0 p-3 mb-3 text-start shadow-sm">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <i className="fas fa-phone-alt"></i>
            </div>
            <div>
              <small className="text-muted d-block fw-semibold">Número Convencional</small>
              <a href={`tel:+505${selectedAutoridad.telefono}`} className="text-dark fw-bold text-decoration-none">
                +505 {selectedAutoridad.telefono}
              </a>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <i className="fas fa-envelope"></i>
            </div>
            <div className="text-truncate">
              <small className="text-muted d-block fw-semibold">Correo Electrónico</small>
              <a href={`mailto:${selectedAutoridad.contacto}`} className="text-dark fw-bold text-decoration-none text-truncate d-block" title={selectedAutoridad.contacto}>
                {selectedAutoridad.contacto}
              </a>
            </div>
          </div>
        </div>

        <button 
          type="button" 
          className="btn btn-secondary btn-sm w-100 rounded-pill py-2 fw-semibold"
          onClick={() => setShowContactModal(false)}
        >
          Volver
        </button>
      </div>
    </div>
  );

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
              <div className="autoridad-card h-100 d-flex flex-column">
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
                <div className="autoridad-body d-flex flex-column flex-grow-1">
                  <h4 className="autoridad-nombre">{autoridad.nombre}</h4>
                  <h6 className="autoridad-cargo">{autoridad.cargo}</h6>
                  <p className="autoridad-frase flex-grow-1">{autoridad.frase}</p>
                  <button
                    className="btn btn-outline-danger btn-sm w-100 mt-2 rounded-pill fw-semibold"
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

      {/* RENDERIZA LOS MODALES FUERA DE LA SECCIÓN MEDIANTE PORTAL */}
      {typeof document !== 'undefined' && ReactDOM.createPortal(
        <>
          {modalContent}
          {contactModalContent}
        </>,
        document.body
      )}
    </section>
  );
};

export default Autoridades;