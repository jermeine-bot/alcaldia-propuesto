import React, { useEffect, useState, useRef } from 'react';

const cityStats = [
  {
    id: 1,
    icon: 'fa-users',
    number: 210500,
    suffix: '+',
    title: 'Población Estimada',
    subtitle: 'Habitantes en el área urbana y comarcas rurales de León',
    category: 'Población',
    badge: 'Demografía',
    percentage: 85,
    color: '#B22222',
    detalles: {
      descripcion: 'León es la segunda ciudad en importancia demográfica de Nicaragua, caracterizada por su juventud universitaria, historia viva y pujante desarrollo comunitario.',
      desglose: [
        { label: 'Población Urbana', value: '165,200 habitantes (78.5%)' },
        { label: 'Población Rural', value: '45,300 habitantes (21.5%)' },
        { label: 'Comunidades atendidas', value: '114 comarcas' },
        { label: 'Estudiantes Universitarios', value: '38,000+ inscritos' }
      ]
    }
  },
  {
    id: 2,
    icon: 'fa-map-marked-alt',
    number: 820,
    suffix: ' km²',
    title: 'Extensión Territorial',
    subtitle: 'Área urbana y rural del municipio de León',
    category: 'Geografía',
    badge: 'Territorio',
    percentage: 100,
    color: '#1E1D1B',
    detalles: {
      descripcion: 'Abarca desde la impresionante Cordillera de los Maribios hasta las hermosas playas del Océano Pacífico, combinando valles fértiles y biodiversidad.',
      desglose: [
        { label: 'Área Urbana', value: '42 km²' },
        { label: 'Área Rural', value: '778 km²' },
        { label: 'Línea Costera', value: '22 km de playas (Las Peñitas y Poneloya)' },
        { label: 'Volcanes Jurisdiccionales', value: 'Cerro Negro, Telica y Cerro Asososca' }
      ]
    }
  },
  {
    id: 3,
    icon: 'fa-landmark',
    number: 16,
    suffix: ' Templos',
    title: 'Patrimonio Cultural',
    subtitle: 'Incluye la Catedral de León (UNESCO 2011)',
    category: 'Cultura',
    badge: 'UNESCO',
    percentage: 95,
    color: '#8B0000',
    detalles: {
      descripcion: 'Reconocida internacionalmente como la Capital Cultural de Nicaragua, cuna del insigne poeta Rubén Darío y poseedora de joyas arquitectónicas.',
      desglose: [
        { label: 'Insignia UNESCO 2011', value: 'Real e Insigne Basílica Catedral de León' },
        { label: 'Patrimonio UNESCO 2000', value: 'Ruinas de León Viejo' },
        { label: 'Templos Históricos', value: 'El Sutiaba, La Recolección, San Francisco, El Calvario' },
        { label: 'Espacios Culturales', value: 'Museo Rubén Darío, Centro de Arte Fundación Ortiz-Gurdián' }
      ]
    }
  },
  {
    id: 4,
    icon: 'fa-city',
    number: 24,
    suffix: ' Obras',
    title: 'Proyectos Activos',
    subtitle: 'Infraestructura vial, parques comunitarios y mejoramiento urbano',
    category: 'Desarrollo',
    badge: 'Gestión 2024-2026',
    percentage: 78,
    color: '#C62828',
    detalles: {
      descripcion: 'El Gobierno Municipal impulsa proyectos de gran escala para transformar la infraestructura vial, el drenaje y la recreación familiar.',
      desglose: [
        { label: 'Parque Lineal Río Chiquito', value: '68% de avance' },
        { label: 'Mercado Santos Bárcenas', value: '100% Completado' },
        { label: 'Calles para el Pueblo', value: '42 cuadras asfaltadas y adoquinadas' },
        { label: 'Espacios Verdes', value: 'Reforestación y parques comunitarios' }
      ]
    }
  },
  {
    id: 5,
    icon: 'fa-broom',
    number: 98,
    suffix: '%',
    title: 'Cobertura de Servicios',
    subtitle: 'Limpieza pública, iluminación LED y mantenimiento de parques',
    category: 'Servicios',
    badge: 'Calidad 24/7',
    percentage: 98,
    color: '#2B2927',
    detalles: {
      descripcion: 'Equipos de servicios municipales despliegan jornadas continuas de limpieza, ornato e iluminación para mantener una ciudad limpia y segura.',
      desglose: [
        { label: 'Rutas de Recolección', value: '28 rutas diarias urbanas y rurales' },
        { label: 'Volumen Recolectado', value: '180+ toneladas de basura diarias' },
        { label: 'Alumbrado LED', value: '12,400 luminarias eficientes' },
        { label: 'Parques Rehabilitados', value: '35 áreas infantiles y deportivas' }
      ]
    }
  },
  {
    id: 6,
    icon: 'fa-plane-arrival',
    number: 125000,
    suffix: '+',
    title: 'Turistas Anuales',
    subtitle: 'Visitantes que disfrutan de nuestra historia, volcanes y playas',
    category: 'Turismo',
    badge: 'Economía Local',
    percentage: 90,
    color: '#B22222',
    detalles: {
      descripcion: 'Destino imperdible del turismo internacional por su combinación única de deporte extremo en volcanes, arquitectura colonial y hermosas playas.',
      desglose: [
        { label: 'Turismo de Aventura', value: 'Volcano Boarding en el volcán Cerro Negro' },
        { label: 'Turismo de Playa', value: 'Surfeo en Las Peñitas y tour en Isla Juan Venado' },
        { label: 'Gastronomía León', value: 'Quesillos, Fritanga y Chicha leonesa' },
        { label: 'Oferta de Hospedaje', value: '85+ hoteles y hostales familiares' }
      ]
    }
  }
];

const AnimatedValue = ({ target, suffix = '', isVisible = false }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    const duration = 2400;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(Math.floor(ease * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [target, isVisible]);

  return (
    <span>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
};

const Estadisticas = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedStat, setSelectedStat] = useState(null);

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

  const categories = ['Todos', 'Población', 'Desarrollo', 'Cultura', 'Servicios', 'Geografía', 'Turismo'];

  const filteredStats = activeCategory === 'Todos' 
    ? cityStats 
    : cityStats.filter(s => s.category === activeCategory);

  return (
    <section id="estadisticas" ref={sectionRef} className="estadisticas-section py-5 position-relative">
      {/* Elementos Decorativos de Fondo */}
      <div className="stats-bg-glow glow-1"></div>
      <div className="stats-bg-glow glow-2"></div>

      <div className="container position-relative z-1">
        
        {/* ENCABEZADO DE SECCIÓN CON BADGE ANIMADO */}
        <div className="section-header text-center mb-5">
          <span className="stats-header-badge mb-2 d-inline-flex align-items-center gap-2">
            <span className="pulse-dot"></span>
            DATOS Y ESTADÍSTICAS EN VIVO
          </span>
          <h2 className="section-title text-gradient-main mt-2">
            Datos de León: Población, Proyectos e Indicadores Municipales
          </h2>
          <p className="section-description mx-auto" style={{ maxWidth: '720px' }}>
            Explora los datos clave de la Primera Capital de la Revolución: nuestra demografía, extensión territorial, legado cultural, proyectos viales y servicios comunitarios.
          </p>
        </div>

        {/* FILTROS POR CATEGORÍA DE DATOS */}
        <div className="stats-filters-container d-flex justify-content-center gap-2 mb-5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`stats-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* REJILLA DE TARJETAS ESTADÍSTICAS GLASSMORPHISM CON ANIMACIÓN */}
        <div className="row g-4 justify-content-center">
          {filteredStats.map((stat, idx) => (
            <div key={stat.id} className="col-lg-4 col-md-6 col-sm-12">
              <div
                className={`city-stat-card-glass ${isVisible ? 'card-animated-in' : ''}`}
                style={{ 
                  animationDelay: `${idx * 120}ms`,
                  borderTop: `3px solid ${stat.color}`
                }}
                onClick={() => setSelectedStat(stat)}
                title="Haz clic para ver el desglose detallado"
              >
                <div className="stat-card-top d-flex align-items-center justify-content-between">
                  <div 
                    className="stat-icon-wrapper" 
                    style={{ 
                      backgroundColor: `${stat.color}15`, 
                      color: stat.color,
                      boxShadow: `0 8px 20px ${stat.color}25`
                    }}
                  >
                    <i className={`fas ${stat.icon}`}></i>
                  </div>
                  <span className="stat-badge-pill" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                    {stat.badge}
                  </span>
                </div>

                <div className="stat-card-body mt-3">
                  <div className="stat-number-display" style={{ color: stat.color }}>
                    <AnimatedValue target={stat.number} suffix={stat.suffix} isVisible={isVisible} />
                  </div>
                  <h4 className="stat-card-title mt-1">{stat.title}</h4>
                  <p className="stat-card-subtitle">{stat.subtitle}</p>
                </div>

                {/* Medidor de avance progresivo */}
                <div className="stat-card-meter-bar mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="meter-label">Indicador Municipal</span>
                    <span className="meter-percentage" style={{ color: stat.color }}>{stat.percentage}%</span>
                  </div>
                  <div className="meter-track">
                    <div 
                      className="meter-fill" 
                      style={{ 
                        width: isVisible ? `${stat.percentage}%` : '0%', 
                        backgroundColor: stat.color,
                        boxShadow: `0 0 10px ${stat.color}`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Botón sutil de ver detalles */}
                <div className="stat-card-footer mt-3 pt-2 d-flex align-items-center justify-content-between border-top border-secondary border-opacity-10">
                  <span className="small text-muted font-medium">Ver desglose completo</span>
                  <i className="fas fa-chevron-right text-danger small"></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BANNER INFORMATIVO ANIMADO */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="city-highlights-banner-premium">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-pill text-white small mb-2 fw-semibold">
                    <i className="fas fa-crown text-warning"></i> Ciudad Creativa y del Aprendizaje
                  </div>
                  <h3 className="fw-bold text-white mb-2">León: Primera Capital de la Revolución y Orgullo Nacional</h3>
                  <p className="text-white-50 mb-0">
                    Impulsando el desarrollo sostenible, la conservación histórica y el bienestar social de todas las familias leonesas.
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                  <a href="#proyectos" className="btn btn-light btn-lg px-4 rounded-pill fw-bold shadow-lg btn-banner-action">
                    Explorar Obras <i className="fas fa-arrow-right ms-2"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL INTERACTIVO DE DESGLOSE DE INDICADOR */}
      {selectedStat && (
        <div className="stat-modal-backdrop" onClick={() => setSelectedStat(null)}>
          <div className="stat-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="stat-modal-close" onClick={() => setSelectedStat(null)}>
              &times;
            </button>
            <div className="stat-modal-header d-flex align-items-center gap-3 mb-3">
              <div 
                className="stat-icon-wrapper-large" 
                style={{ backgroundColor: `${selectedStat.color}20`, color: selectedStat.color }}
              >
                <i className={`fas ${selectedStat.icon}`}></i>
              </div>
              <div>
                <span className="stat-badge-pill" style={{ backgroundColor: `${selectedStat.color}15`, color: selectedStat.color }}>
                  {selectedStat.badge}
                </span>
                <h3 className="fw-bold mb-0 mt-1" style={{ color: 'var(--text-dark)' }}>{selectedStat.title}</h3>
              </div>
            </div>

            <div className="stat-modal-body">
              <div className="display-4 fw-extrabold mb-2" style={{ color: selectedStat.color }}>
                {selectedStat.number.toLocaleString()}{selectedStat.suffix}
              </div>
              <p className="text-muted mb-4">{selectedStat.detalles.descripcion}</p>

              <h6 className="fw-bold text-uppercase small text-danger letter-spacing-1 mb-3">Desglose e Información Relevante:</h6>
              <div className="row g-2">
                {selectedStat.detalles.desglose.map((item, i) => (
                  <div key={i} className="col-12">
                    <div className="stat-detail-item d-flex align-items-center justify-content-between p-3 rounded-3">
                      <span className="fw-semibold text-secondary small">{item.label}</span>
                      <span className="fw-bold text-dark small ms-2 text-end">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="stat-modal-footer mt-4 pt-3 border-top d-flex justify-content-end">
              <button className="btn btn-outline-danger btn-sm px-4 rounded-pill" onClick={() => setSelectedStat(null)}>
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Estadisticas;