// Datos iniciales extraídos de los componentes actuales de la landing page

export const initialHeroData = {
  id: 'hero-1',
  title: 'Bienvenidos a la Alcaldía Municipal de León',
  subtitle: 'Construyendo juntos el futuro de nuestra ciudad, con transparencia, innovación y compromiso con cada leonés.',
  video_url: '/video/leon nicaragua vista de un dron.mp4',
  fallback_image_url: '/img/hero-bg.jpg',
  primary_btn_text: 'Conoce León',
  primary_btn_link: '#turismo',
  secondary_btn_text: 'Servicios Rápidos',
  secondary_btn_link: '#servicios',
  is_active: true
};

export const initialNoticiasData = [
  {
    id: 'noticia-1',
    img: '/img/noticias/noticia1.jpg',
    date: '15 Enero 2026',
    title: 'Inauguración del nuevo Parque Central',
    summary: 'Un espacio renovado para el disfrute de todas las familias leonesas.',
    content: 'La Alcaldía Municipal de León se enorgullece en inaugurar las obras de remodelación y embellecimiento del Parque Central. El proyecto incluye nuevas áreas verdes, iluminación LED de última generación y zonas de recreación infantil.',
    category: 'Obras Públicas',
    author: 'Prensa Alcaldía',
    status: 'published',
    is_featured: true,
    display_order: 1
  },
  {
    id: 'noticia-2',
    img: '/img/noticias/noticia2.jpg',
    date: '12 Enero 2026',
    title: 'Nuevo sistema de recolección de basura',
    summary: 'Modernizamos el servicio para una ciudad más limpia y sostenible.',
    content: 'Con la incorporación de una flota de camiones recolectores modernos y el establecimiento de 28 nuevas rutas urbanas y rurales, garantizamos una atención continua y eficiente para todas las familias.',
    category: 'Servicios Municipales',
    author: 'Dirección de Ornato',
    status: 'published',
    is_featured: true,
    display_order: 2
  },
  {
    id: 'noticia-3',
    img: '/img/noticias/festival de la poseia.jpg',
    date: '10 Enero 2026',
    title: 'Festival de Poesía 2026',
    summary: 'León se prepara para el evento cultural más importante del año.',
    content: 'Poetas e intelectuales de diversas naciones se darán cita en la Capital Cultural de Nicaragua para celebrar una nueva edición de este magno festival en homenaje a nuestro gran Rubén Darío.',
    category: 'Cultura & Arte',
    author: 'Unidad de Cultura',
    status: 'published',
    is_featured: true,
    display_order: 3
  },
  {
    id: 'noticia-4',
    img: '/img/noticias/noticia3.jpg',
    date: '8 Enero 2026',
    title: 'Obras de pavimentación avanzan',
    summary: 'Transformando las calles de León para mejorar la movilidad.',
    content: 'Avanzamos a paso firme con el plan "Calles para el Pueblo", adoquinando y reasfaltando vías estratégicas en los barrios Sutsiaba, Guadalupe y repartos periféricos.',
    category: 'Vialidad',
    author: 'Infraestructura',
    status: 'published',
    is_featured: false,
    display_order: 4
  }
];

export const initialProyectosData = [
  {
    id: 'proyecto-1',
    img: '/img/proyectos/proyecto1.jpg',
    category: 'Infraestructura',
    status: 'En Progreso',
    isCompleted: false,
    title: 'Parque Lineal del Río Chiquito',
    desc: 'Recuperación ambiental, reforestación y creación de senderos ecológicos y espacios recreativos para familias leonesas.',
    detailed_desc: 'Este mega proyecto contempla la limpieza integral del cauce, siembra de más de 5,000 árboles nativos, instalación de luminarias solares y construcción de ciclovías.',
    location: 'Río Chiquito, León',
    cost: 'C$ 45.2M',
    progress: 68,
    startDate: 'Enero 2024',
    beneficiaries: '35,000 Habitantes',
    is_published: true
  },
  {
    id: 'proyecto-2',
    img: '/img/proyectos/proyecto2.jpg',
    category: 'Comercio & Economía',
    status: 'Completado',
    isCompleted: true,
    title: 'Modernización del Mercado Municipal Santos Bárcenas',
    desc: 'Renovación de tramos, sistema eléctrico moderno, agua potable y accesibilidad universal para comerciantes y clientes.',
    detailed_desc: 'Rehabilitación total de techo, nuevo sistema contra incendios y ordenamiento de más de 300 tramos comerciales para garantizar compras seguras y cómodas.',
    location: 'Centro Histórico, León',
    cost: 'C$ 32.8M',
    progress: 100,
    startDate: 'Julio 2023',
    beneficiaries: '50,000 Habitantes',
    is_published: true
  },
  {
    id: 'proyecto-3',
    img: '/img/proyectos/proyecto1.jpg',
    category: 'Vialidad',
    status: 'En Progreso',
    isCompleted: false,
    title: 'Pavimentación y Drenaje en Barrios Periféricos',
    desc: 'Mejoramiento de 15 kilómetros de calles adoquinadas y ampliación de alcantarillado sanitario.',
    detailed_desc: 'Intervención integral en alcantarillado pluvial y mejoramiento de vialidad en zonas vulnerables durante la temporada de lluvias.',
    location: 'Sutsubiaba y Repartos Norte',
    cost: 'C$ 28.5M',
    progress: 82,
    startDate: 'Marzo 2024',
    beneficiaries: '22,000 Habitantes',
    is_published: true
  },
  {
    id: 'proyecto-4',
    img: '/img/proyectos/proyecto2.jpg',
    category: 'Cultura & Turismo',
    status: 'Completado',
    isCompleted: true,
    title: 'Restauración del Centro Cultural y Mosaicos Históricos',
    desc: 'Preservación de monumentos emblemáticos, pintura en fachadas históricas e iluminación LED ornamental.',
    detailed_desc: 'Restauración patrimonial respetando el estilo neoclásico y colonial de la primera capital.',
    location: 'Plaza de la Liberación',
    cost: 'C$ 18.0M',
    progress: 100,
    startDate: 'Noviembre 2023',
    beneficiaries: '120,000 Visitantes',
    is_published: true
  }
];

export const initialTurismoData = [
  {
    id: 'turismo-1',
    img: '/img/turismo/catedral.jpg',
    title: 'Basílica Catedral de León',
    desc: 'La catedral más grande de Centroamérica y Patrimonio de la Humanidad UNESCO.',
    category: 'Patrimonio & Historia',
    location: 'Plaza Mayor, Centro Histórico',
    content: 'La Real e Insigne Basílica Catedral de la Asunción de la Bienaventurada Virgen María es uno de los monumentos más icónicos de América Latina. En sus criptas descansan los restos del insigne poeta Rubén Darío.',
    is_published: true,
    display_order: 1
  },
  {
    id: 'turismo-2',
    img: '/img/turismo/leon-viejo.jpg',
    title: 'Ruinas de León Viejo',
    desc: 'Primer asentamiento de la ciudad y Patrimonio Cultural UNESCO.',
    category: 'Patrimonio UNESCO',
    location: 'Puerto Momotombo',
    content: 'Fundada en 1524 por Francisco Hernández de Córdoba al pie del volcán Momotombo. Sepultada por las cenizas volcánicas, conserva el trazado urbano original del siglo XVI.',
    is_published: true,
    display_order: 2
  },
  {
    id: 'turismo-3',
    img: '/img/turismo/cerro-negro.jpg',
    title: 'Volcán Cerro Negro',
    desc: 'El volcán más joven de Centroamérica y meca mundial del Volcano Boarding.',
    category: 'Aventura & Naturaleza',
    location: 'Cordillera de los Maribios',
    content: 'Siente la adrenalina descendiendo a toda velocidad sobre las laderas de arena negra de este activo volcán.',
    is_published: true,
    display_order: 3
  },
  {
    id: 'turismo-4',
    img: '/img/turismo/las-penitas.jpg',
    title: 'Playas de Las Peñitas y Poneloya',
    desc: 'Playas paradisíacas con atardeceres espectaculares y olas ideales para el surf.',
    category: 'Playas & Sol',
    location: 'Costa del Pacífico leonés',
    content: 'Destino por excelencia para turistas nacionales e internacionales que buscan buena gastronomía marina, mariscos frescos y surfing.',
    is_published: true,
    display_order: 4
  }
];

export const initialCulturaData = [
  {
    id: 'cultura-1',
    icon: 'fa-cross',
    title: 'Semana Santa y Alfombras de Aserrín',
    desc: 'La tradición religiosa y artística más impresionante confeccionada en las calles de Sutiaba.',
    event_date: 'Marzo / Abril 2026',
    event_time: 'Todo el día',
    location: 'Barrio Sutiaba, León',
    image_url: '/img/cultura/semana_santa.jpg',
    is_published: true
  },
  {
    id: 'cultura-2',
    icon: 'fa-fist-raised',
    title: 'La Gritería en Honor a la Purísima',
    desc: 'La fiesta mariana más alegre, colorida y multitudinaria de Nicaragua.',
    event_date: '7 de Diciembre',
    event_time: '6:00 PM',
    location: 'Catedral y barrios de León',
    image_url: '/img/cultura/griteria.jpg',
    is_published: true
  },
  {
    id: 'cultura-3',
    icon: 'fa-feather-alt',
    title: 'Festival Internacional de Poesía',
    desc: 'El evento literario y cultural más importante en honor al príncipe de las letras castellanas.',
    event_date: '18 al 22 de Enero',
    event_time: '9:00 AM - 8:00 PM',
    location: 'Teatro Municipal José de la Cruz Mena',
    image_url: '/img/cultura/poesia.jpg',
    is_published: true
  }
];

export const initialStatsData = [
  {
    id: 'stat-1',
    icon: 'fa-users',
    number: 210500,
    suffix: '+',
    title: 'Población Estimada',
    subtitle: 'Habitantes en el área urbana y comarcas rurales de León',
    category: 'Población',
    badge: 'Demografía',
    percentage: 85,
    color: '#B22222',
    description: 'León es la segunda ciudad en importancia demográfica de Nicaragua, caracterizada por su juventud universitaria, historia viva y pujante desarrollo comunitario.',
    breakdown: [
      { label: 'Población Urbana', value: '165,200 habitantes (78.5%)' },
      { label: 'Población Rural', value: '45,300 habitantes (21.5%)' },
      { label: 'Comunidades atendidas', value: '114 comarcas' },
      { label: 'Estudiantes Universitarios', value: '38,000+ inscritos' }
    ],
    is_published: true,
    display_order: 1
  },
  {
    id: 'stat-2',
    icon: 'fa-map-marked-alt',
    number: 820,
    suffix: ' km²',
    title: 'Extensión Territorial',
    subtitle: 'Área urbana y rural del municipio de León',
    category: 'Geografía',
    badge: 'Territorio',
    percentage: 100,
    color: '#1E1D1B',
    description: 'Abarca desde la impresionante Cordillera de los Maribios hasta las hermosas playas del Océano Pacífico, combinando valles fértiles y biodiversidad.',
    breakdown: [
      { label: 'Área Urbana', value: '42 km²' },
      { label: 'Área Rural', value: '778 km²' },
      { label: 'Línea Costera', value: '22 km de playas (Las Peñitas y Poneloya)' },
      { label: 'Volcanes Jurisdiccionales', value: 'Cerro Negro, Telica y Cerro Asososca' }
    ],
    is_published: true,
    display_order: 2
  },
  {
    id: 'stat-3',
    icon: 'fa-landmark',
    number: 16,
    suffix: ' Templos',
    title: 'Patrimonio Cultural',
    subtitle: 'Incluye la Catedral de León (UNESCO 2011)',
    category: 'Cultura',
    badge: 'UNESCO',
    percentage: 95,
    color: '#8B0000',
    description: 'Reconocida internacionalmente como la Capital Cultural de Nicaragua, cuna del insigne poeta Rubén Darío y poseedora de joyas arquitectónicas.',
    breakdown: [
      { label: 'Insignia UNESCO 2011', value: 'Real e Insigne Basílica Catedral de León' },
      { label: 'Patrimonio UNESCO 2000', value: 'Ruinas de León Viejo' },
      { label: 'Templos Históricos', value: 'El Sutiaba, La Recolección, San Francisco, El Calvario' },
      { label: 'Espacios Culturales', value: 'Museo Rubén Darío, Centro de Arte Fundación Ortiz-Gurdián' }
    ],
    is_published: true,
    display_order: 3
  },
  {
    id: 'stat-4',
    icon: 'fa-city',
    number: 24,
    suffix: ' Obras',
    title: 'Proyectos Activos',
    subtitle: 'Infraestructura vial, parques comunitarios y mejoramiento urbano',
    category: 'Desarrollo',
    badge: 'Gestión 2024-2026',
    percentage: 78,
    color: '#C62828',
    description: 'El Gobierno Municipal impulsa proyectos de gran escala para transformar la infraestructura vial, el drenaje y la recreación familiar.',
    breakdown: [
      { label: 'Parque Lineal Río Chiquito', value: '68% de avance' },
      { label: 'Mercado Santos Bárcenas', value: '100% Completado' },
      { label: 'Calles para el Pueblo', value: '42 cuadras asfaltadas y adoquinadas' },
      { label: 'Espacios Verdes', value: 'Reforestación y parques comunitarios' }
    ],
    is_published: true,
    display_order: 4
  },
  {
    id: 'stat-5',
    icon: 'fa-broom',
    number: 98,
    suffix: '%',
    title: 'Cobertura de Servicios',
    subtitle: 'Limpieza pública, iluminación LED y mantenimiento de parques',
    category: 'Servicios',
    badge: 'Calidad 24/7',
    percentage: 98,
    color: '#2B2927',
    description: 'Equipos de servicios municipales despliegan jornadas continuas de limpieza, ornato e iluminación para mantener una ciudad limpia y segura.',
    breakdown: [
      { label: 'Rutas de Recolección', value: '28 rutas diarias urbanas y rurales' },
      { label: 'Volumen Recolectado', value: '180+ toneladas de basura diarias' },
      { label: 'Alumbrado LED', value: '12,400 luminarias eficientes' },
      { label: 'Parques Rehabilitados', value: '35 áreas infantiles y deportivas' }
    ],
    is_published: true,
    display_order: 5
  },
  {
    id: 'stat-6',
    icon: 'fa-plane-arrival',
    number: 125000,
    suffix: '+',
    title: 'Turistas Anuales',
    subtitle: 'Visitantes que disfrutan de nuestra historia, volcanes y playas',
    category: 'Turismo',
    badge: 'Economía Local',
    percentage: 90,
    color: '#B22222',
    description: 'Destino imperdible del turismo internacional por su combinación única de deporte extremo en volcanes, arquitectura colonial y hermosas playas.',
    breakdown: [
      { label: 'Turismo de Aventura', value: 'Volcano Boarding en el volcán Cerro Negro' },
      { label: 'Turismo de Playa', value: 'Surfeo en Las Peñitas y tour en Isla Juan Venado' },
      { label: 'Gastronomía León', value: 'Quesillos, Fritanga y Chicha leonesa' },
      { label: 'Oferta de Hospedaje', value: '85+ hoteles y hostales familiares' }
    ],
    is_published: true,
    display_order: 6
  }
];

export const initialContactoData = {
  id: 'contacto-1',
  address: 'Palacio Municipal, Frente al Parque Central, León, Nicaragua',
  phone: '+505 2315-0000',
  secondary_phone: '+505 2315-1111',
  email: 'info@alcaldaleon.gob.ni',
  schedule: 'Lunes a Viernes: 8:00 AM - 4:00 PM',
  facebook_url: 'https://www.facebook.com/share/1EJ2g1UpjY/',
  instagram_url: 'https://www.instagram.com/alcaldia_leon',
  tiktok_url: 'https://www.tiktok.com/@leonalcaldia',
  youtube_url: 'https://www.youtube.com/@AlcaldiaLeon',
  twitter_url: 'https://twitter.com/alcaldia_leon'
};
