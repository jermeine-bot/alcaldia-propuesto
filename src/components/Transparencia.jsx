import React from 'react';

const transparenciaData = [
  { id: 1, icon: 'fa-chart-pie', title: 'Presupuesto', desc: 'Consulta el presupuesto municipal' },
  { id: 2, icon: 'fa-file-contract', title: 'Contrataciones', desc: 'Procesos de contratación abiertos' },
  { id: 3, icon: 'fa-gavel', title: 'Licitaciones', desc: 'Licitaciones públicas vigentes' },
  { id: 4, icon: 'fa-database', title: 'Datos Abiertos', desc: 'Acceso a datos municipales' }
];

const Transparencia = () => {
  return (
    <section id="transparencia" className="transparencia-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Gobierno Abierto</span>
          <h2 className="section-title">Transparencia</h2>
          <p className="section-description">Comprometidos con la transparencia y el acceso a la información</p>
        </div>

        <div className="row g-4">
          {transparenciaData.map((item) => (
            <div key={item.id} className="col-lg-3 col-md-6">
              <div className="transparencia-card">
                <i className={`fas ${item.icon}`}></i>
                <h5>{item.title}</h5>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Transparencia;
