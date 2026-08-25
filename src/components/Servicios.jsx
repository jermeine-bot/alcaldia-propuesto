import React from 'react';

const serviciosData = [
  { id: 1, icon: 'fa-hand-holding-usd', title: 'Pago de Impuestos', desc: 'Realiza tus pagos en línea' },
  { id: 2, icon: 'fa-file-signature', title: 'Permisos', desc: 'Solicita permisos municipales' },
  { id: 3, icon: 'fa-map-marked-alt', title: 'Catastro', desc: 'Consulta catastral en línea' },
  { id: 4, icon: 'fa-store', title: 'Mercados', desc: 'Información de mercados' },
  { id: 5, icon: 'fa-church', title: 'Cementerios', desc: 'Servicios cementerios' },
  { id: 6, icon: 'fa-trash-alt', title: 'Recolección de Basura', desc: 'Horarios y rutas' },
  { id: 7, icon: 'fa-exclamation-triangle', title: 'Denuncias', desc: 'Reporta problemas' },
  { id: 8, icon: 'fa-calendar-check', title: 'Agenda', desc: 'Agenda tu cita' }
];

const Servicios = () => {
  return (
    <section id="servicios" className="servicios-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Servicios</span>
          <h2 className="section-title">Trámites y Servicios Rápidos</h2>
          <p className="section-description">Accede a los servicios municipales de forma ágil y sencilla</p>
        </div>

        <div className="row g-4">
          {serviciosData.map((item) => (
            <div key={item.id} className="col-lg-3 col-md-4 col-sm-6">
              <div className="servicio-card">
                <div className="servicio-icon">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <h5>{item.title}</h5>
                <p>{item.desc}</p>
                <a href="#contacto" className="servicio-link">
                  Acceder <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Servicios;
