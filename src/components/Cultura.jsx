import React from 'react';

const culturaData = [
  {
    id: 1,
    icon: 'fa-cross',
    title: 'Semana Santa',
    desc: 'La tradición religiosa más importante de León'
  },
  {
    id: 2,
    icon: 'fa-fist-raised',
    title: 'La Gritería',
    desc: 'La fiesta más alegre y colorida de Nicaragua'
  },
  {
    id: 3,
    icon: 'fa-feather-alt',
    title: 'Festival de Poesía',
    desc: 'El evento literario más importante de Centroamérica'
  }
];

const Cultura = () => {
  return (
    <section id="cultura" className="cultura-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Tradición</span>
          <h2 className="section-title">Cultura y Eventos</h2>
          <p className="section-description">Vive la riqueza cultural de nuestra ciudad</p>
        </div>

        <div className="row g-4">
          {culturaData.map((item) => (
            <div key={item.id} className="col-lg-4 col-md-6">
              <div className="cultura-card">
                <div className="cultura-icon">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
                <a href="#contacto" className="cultura-link">Conocer más</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Cultura;
