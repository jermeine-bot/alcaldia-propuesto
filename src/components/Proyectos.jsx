import React, { useState, useEffect, useRef } from 'react';

const proyectosData = [
  {
    id: 1,
    img: '/img/proyectos/proyecto1.jpg',
    category: 'Infraestructura',
    status: 'En Progreso',
    isCompleted: false,
    title: 'Parque Lineal del Río Chiquito',
    desc: 'Recuperación ambiental, reforestación y creación de senderos ecológicos y espacios recreativos para familias leonesas.',
    location: 'Río Chiquito, León',
    cost: 'C$ 45.2M',
    progress: 68,
    startDate: 'Enero 2024',
    beneficiaries: '35,000 Habitantes'
  },
  {
    id: 2,
    img: '/img/proyectos/proyecto2.jpg',
    category: 'Comercio & Economía',
    status: 'Completado',
    isCompleted: true,
    title: 'Modernización del Mercado Municipal Santos Bárcenas',
    desc: 'Renovación de tramos, sistema eléctrico moderno, agua potable y accesibilidad universal para comerciantes y clientes.',
    location: 'Centro Histórico, León',
    cost: 'C$ 32.8M',
    progress: 100,
    startDate: 'Julio 2023',
    beneficiaries: '50,000 Habitantes'
  },
  {
    id: 3,
    img: '/img/proyectos/proyecto1.jpg',
    category: 'Vialidad',
    status: 'En Progreso',
    isCompleted: false,
    title: 'Pavimentación y Drenaje en Barrios Periféricos',
    desc: 'Mejoramiento de 15 kilómetros de calles adoquinadas y ampliación de alcantarillado sanitario.',
    location: 'Sutsubiaba y Repartos Norte',
    cost: 'C$ 28.5M',
    progress: 82,
    startDate: 'Marzo 2024',
    beneficiaries: '22,000 Habitantes'
  },
  {
    id: 4,
    img: '/img/proyectos/proyecto2.jpg',
    category: 'Cultura & Turismo',
    status: 'Completado',
    isCompleted: true,
    title: 'Restauración del Centro Cultural y Mosaicos Históricos',
    desc: 'Preservación de monumentos emblemáticos, pintura en fachadas históricas e iluminación LED ornamental.',
    location: 'Plaza de la Liberación',
    cost: 'C$ 18.0M',
    progress: 100,
    startDate: 'Noviembre 2023',
    beneficiaries: '120,000 Visitantes'
  }
];

const Proyectos = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const filteredProyectos = proyectosData.filter((item) => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'En Progreso') return !item.isCompleted;
    if (activeFilter === 'Completados') return item.isCompleted;
    return item.category === activeFilter;
  });

  return (
    <section id="proyectos" ref={sectionRef} className="proyectos-section py-5 position-relative">
      <div className="container">
        
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Obras e Inversión Municipal</span>
          <h2 className="section-title">Proyectos de Transformación en León</h2>
          <p className="section-description">
            Obras estratégicas enfocadas en mejorar la infraestructura vial, espacios públicos, mercados y conservación patrimonial.
          </p>
        </div>

        {/* FILTROS INTERACTIVOS */}
        <div className="d-flex justify-content-center gap-2 mb-5 flex-wrap">
          {['Todos', 'En Progreso', 'Completados', 'Infraestructura', 'Vialidad'].map((filter) => (
            <button
              key={filter}
              className={`btn btn-sm rounded-pill px-4 transition-all ${activeFilter === filter ? 'btn-danger shadow-sm' : 'btn-outline-secondary'}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* LISTADO DE PROYECTOS */}
        <div className="row g-4">
          {filteredProyectos.map((item, idx) => (
            <div key={item.id} className="col-lg-6">
              <div 
                className={`proyecto-card shadow-sm ${isVisible ? 'proyecto-card-animated' : ''}`}
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                <div className="proyecto-img-wrapper">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="proyecto-img"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x300?text=Proyecto+Municipal';
                    }}
                  />
                  <span className={`proyecto-status ${item.isCompleted ? 'status-completed' : 'status-progress'}`}>
                    <i className={item.isCompleted ? 'fas fa-check-circle me-1' : 'fas fa-spinner fa-spin me-1'}></i>
                    {item.status}
                  </span>
                  <span className="proyecto-category-badge">
                    {item.category}
                  </span>
                </div>

                <div className="proyecto-content">
                  <h4 className="fw-bold mb-2">{item.title}</h4>
                  <p className="text-muted small mb-3">{item.desc}</p>
                  
                  <div className="proyecto-meta d-flex justify-content-between text-muted small mb-3">
                    <span><i className="fas fa-map-marker-alt text-danger me-1"></i> {item.location}</span>
                    <span><i className="fas fa-coins text-warning me-1"></i> {item.cost}</span>
                  </div>

                  {/* BARRA DE PROGRESO ANIMADA */}
                  <div className="proyecto-progress-wrapper mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small font-semibold">Progreso de Obra</span>
                      <span className="progress-label fw-bold text-danger">{item.progress}%</span>
                    </div>
                    <div className="progress rounded-pill style-progress">
                      <div
                        className={`progress-bar rounded-pill ${item.isCompleted ? 'bg-success' : 'bg-danger'}`}
                        style={{
                          width: isVisible ? `${item.progress}%` : '0%',
                          transition: `width 1.5s cubic-bezier(0.25, 1, 0.5, 1) ${idx * 150}ms`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span className="text-muted small"><i className="fas fa-users me-1 text-primary"></i> {item.beneficiaries}</span>
                    <button 
                      className="btn btn-outline-danger btn-sm rounded-pill px-3"
                      onClick={() => setSelectedProject(item)}
                    >
                      <i className="fas fa-info-circle me-1"></i> Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DETALLES DE PROYECTO */}
      {selectedProject && (
        <div className="social-media-modal-backdrop" onClick={() => setSelectedProject(null)}>
          <div className="social-media-modal-content project-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProject(null)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="row g-4 align-items-center">
              <div className="col-md-5">
                <img src={selectedProject.img} alt={selectedProject.title} className="img-fluid rounded shadow" />
              </div>
              <div className="col-md-7 text-start text-white">
                <span className="badge bg-danger mb-2">{selectedProject.category}</span>
                <h4 className="fw-bold text-white mb-2">{selectedProject.title}</h4>
                <p className="text-white-50 small mb-3">{selectedProject.desc}</p>

                <ul className="list-unstyled text-white-50 small mb-4">
                  <li className="mb-2"><strong className="text-white"><i className="fas fa-map-marker-alt text-danger me-2"></i>Ubicación:</strong> {selectedProject.location}</li>
                  <li className="mb-2"><strong className="text-white"><i className="fas fa-coins text-warning me-2"></i>Inversión Estimada:</strong> {selectedProject.cost}</li>
                  <li className="mb-2"><strong className="text-white"><i className="fas fa-calendar-alt text-info me-2"></i>Inicio de Ejecución:</strong> {selectedProject.startDate}</li>
                  <li className="mb-2"><strong className="text-white"><i className="fas fa-user-friends text-success me-2"></i>Población Beneficiada:</strong> {selectedProject.beneficiaries}</li>
                  <li className="mb-2"><strong className="text-white"><i className="fas fa-chart-line text-primary me-2"></i>Avance Físico:</strong> {selectedProject.progress}%</li>
                </ul>

                <button className="btn btn-danger btn-sm rounded-pill px-4" onClick={() => setSelectedProject(null)}>
                  Cerrar Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Proyectos;

