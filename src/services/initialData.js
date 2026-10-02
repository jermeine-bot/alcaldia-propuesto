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

export const initialServiciosSettings = {
  eyebrow: 'Servicios',
  title: 'Trámites y Servicios Municipales',
  description: 'Hemos simplificado nuestras gestiones en categorías principales para tu comodidad',
  phone: '+505 2315-0000'
};

export const initialServiciosData = [
  {
    id: 'tramites',
    title: 'Trámites Municipales',
    badgeIcon: '🏛️',
    icon: 'fa-landmark',
    subtitle: 'Permisos, licencias y gestiones',
    desc: 'Gestiona autorizaciones urbanas, licencias comerciales y certificaciones sin complicaciones.',
    count: 3,
    opciones: [
      {
        id: 'opt-1',
        icon: 'fa-file-signature',
        title: 'Permisos de Construcción y Obras',
        desc: 'Solicitud y aprobación de proyectos de edificación, remodelación y licencias urbanísticas.',
        linkText: 'Solicitar Permiso',
        linkUrl: '#contacto'
      },
      {
        id: 'opt-2',
        icon: 'fa-certificate',
        title: 'Licencias de Funcionamiento',
        desc: 'Registro, apertura y renovación de licencias para establecimientos comerciales e industriales.',
        linkText: 'Tramitar Licencia',
        linkUrl: '#contacto'
      },
      {
        id: 'opt-3',
        icon: 'fa-stamp',
        title: 'Gestiones y Constancias Administrativas',
        desc: 'Emisión de solidez catastral, constancia de residencia y certificaciones municipales.',
        linkText: 'Obtener Constancia',
        linkUrl: '#contacto'
      }
    ]
  },
  {
    id: 'impuestos',
    title: 'Impuestos y Pagos',
    badgeIcon: '💰',
    icon: 'fa-hand-holding-usd',
    subtitle: 'Consulta y paga tus obligaciones',
    desc: 'Realiza tus pagos municipales de forma rápida, segura y transparente desde cualquier lugar.',
    count: 3,
    opciones: [
      {
        id: 'opt-4',
        icon: 'fa-home',
        title: 'Impuesto sobre Bienes Inmuebles (IBI)',
        desc: 'Consulta tu estado de cuenta de IBI y realiza pagos en línea o en cajas autorizadas.',
        linkText: 'Pagar IBI',
        linkUrl: '#contacto'
      },
      {
        id: 'opt-5',
        icon: 'fa-receipt',
        title: 'Impuesto sobre Ingresos y Matrícula',
        desc: 'Declaración mensual de ventas, matriculación anual y solvencias municipales.',
        linkText: 'Declarar / Pagar',
        linkUrl: '#contacto'
      },
      {
        id: 'opt-6',
        icon: 'fa-calculator',
        title: 'Consulta de Saldos y Solvencias',
        desc: 'Verifica el historial de pagos y solicita tu certificado de solvencia municipal al día.',
        linkText: 'Consultar Saldo',
        linkUrl: '#contacto'
      }
    ]
  },
  {
    id: 'propiedades',
    title: 'Propiedades y Comercio',
    badgeIcon: '🏠',
    icon: 'fa-store',
    subtitle: 'Catastro, mercados y comercio',
    desc: 'Accede a servicios catastrales, regulación de mercados locales y fomento al emprendimiento.',
    count: 3,
    opciones: [
      {
        id: 'opt-7',
        icon: 'fa-map-marked-alt',
        title: 'Consultas Catastrales y Planos',
        desc: 'Información sobre delimitación de terrenos, avalúos catastrales y mapas del municipio.',
        linkText: 'Ver Catastro',
        linkUrl: '#contacto'
      },
      {
        id: 'opt-8',
        icon: 'fa-store-alt',
        title: 'Comercio y Mercados Municipales',
        desc: 'Asignación y canon de tramos en mercados como Central, Santos Bárcenas y Sutiaba.',
        linkText: 'Info Mercados',
        linkUrl: '#contacto'
      },
      {
        id: 'opt-9',
        icon: 'fa-chart-line',
        title: 'Fomento al Emprendimiento Local',
        desc: 'Asesoría para nuevos comerciantes, ferias comunitarias y registro de PyMES.',
        linkText: 'Registrar Negocio',
        linkUrl: '#contacto'
      }
    ]
  },
  {
    id: 'servicios',
    title: 'Servicios y Atención',
    badgeIcon: '🛠️',
    icon: 'fa-hand-holding-heart',
    subtitle: 'Basura, cementerios, denuncias y citas',
    desc: 'Servicios comunitarios directos para mejorar la calidad de vida y atención al ciudadano.',
    count: 4,
    opciones: [
      {
        id: 'opt-10',
        icon: 'fa-trash-alt',
        title: 'Recolección de Basura y Limpieza Urbana',
        desc: 'Consulta los días, rutas y horarios de recolección en tu barrio o comarca.',
        linkText: 'Ver Rutas',
        linkUrl: '#contacto'
      },
      {
        id: 'opt-11',
        icon: 'fa-church',
        title: 'Servicios de Cementerios',
        desc: 'Trámites de mantenimiento, títulos de propiedad y servicios funerarios municipales.',
        linkText: 'Trámites Cementerio',
        linkUrl: '#contacto'
      },
      {
        id: 'opt-12',
        icon: 'fa-exclamation-triangle',
        title: 'Reportes y Denuncias Ciudadanas',
        desc: 'Informa sobre fallas en alumbrado público, baches, fugas o perturbación de paz.',
        linkText: 'Hacer Reporte',
        linkUrl: '#contacto'
      },
      {
        id: 'opt-13',
        icon: 'fa-calendar-check',
        title: 'Agenda de Citas y Atención Presencial',
        desc: 'Reserva tu horario para trámites presenciales en el Palacio Municipal sin filas.',
        linkText: 'Agendar Cita',
        linkUrl: '#contacto'
      }
    ]
  }
];

export const initialCentrosAtencionData = [
  {
    id: 'centro-1',
    serviceLabel: 'Atención tributaria',
    title: 'Plantel Augusto C. Sandino - Fundeci',
    description: 'Centro de atención tributaria para realizar consultas y recibir orientación sobre los tributos municipales.',
    image: 'https://s3.laprensani.com/wp-content/uploads/2020/08/20200827_054944-1536x1152.jpg',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Centro+de+Atenci%C3%B3n+Tributaria+Plantel+Augusto+C.+Sandino+Fundeci%2C+Le%C3%B3n%2C+Nicaragua',
    coordinates: ''
  },
  {
    id: 'centro-2',
    serviceLabel: 'Atención tributaria',
    title: 'Cabildo de Sutiava',
    description: 'Punto de atención tributaria para acercar las gestiones y la orientación municipal a las familias de Sutiava.',
    image: 'https://scontent-mia3-2.xx.fbcdn.net/v/t1.6435-9/53316618_394104814483648_4424533071907258368_n.jpg?stp=dst-jpg_tt6&cstp=mx960x720&ctp=s960x720&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3PcCQj0ryUEQ7kNvwG3XSx2&_nc_oc=AdoxAGoshRtNEGX_QHNMI9aD6lIi_chPm-o43ljxO_Oz7pAu_UuOdJsClIbSZYgYYWU&_nc_zt=23&_nc_ht=scontent-mia3-2.xx&_nc_gid=jxOMDZYlSyA9Zk_-543mfg&_nc_ss=7b289&oh=00_AQOXamRbOgltC3qL1kyyigzMPEhiGYW5FWAJdpNVF9_nXg&oe=6AE759F1',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=12.4334625%2C-86.8962656',
    coordinates: '12.4334625, -86.8962656'
  },
  {
    id: 'centro-3',
    serviceLabel: 'Atención tributaria',
    title: 'Plantel Rigoberto López Pérez - San Felipe',
    description: 'Centro de atención para consultas y orientación sobre servicios y obligaciones tributarias municipales.',
    image: 'https://scontent-mia3-3.xx.fbcdn.net/v/t39.30808-6/476904691_939569444988682_3573219317361155107_n.jpg?stp=dst-jpg_tt6&cstp=mx1280x853&ctp=s1280x853&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=JUqxMr1TfV4Q7kNvwHq84HC&_nc_oc=AdqTkGA-CddnuwnmLiLVVF5GRm_yIa2PR9IzcLvpi3AuwLuILReCEtsqg0IzI2K33z8&_nc_zt=23&_nc_ht=scontent-mia3-3.xx&_nc_gid=9qlya_IIbWhNiapJLGy3JQ&_nc_ss=7b289&oh=00_AQOcOsbnWkS47JJEu-B-MWKRNPkijxlszF7SReE7XtHUCg&oe=6AC5CA98',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Centro+de+Atenci%C3%B3n+Tributaria+Plantel+Rigoberto+L%C3%B3pez+P%C3%A9rez+San+Felipe%2C+Le%C3%B3n%2C+Nicaragua',
    coordinates: ''
  },
  {
    id: 'centro-4',
    serviceLabel: 'Atención tributaria',
    title: 'Parque Forestal - León Sureste',
    description: 'Punto de atención tributaria para facilitar el acceso a las gestiones municipales en el sector sureste de León.',
    image: 'https://scontent-mia3-3.xx.fbcdn.net/v/t1.6435-9/118441073_170572441204275_3221589260549251588_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1072&ctp=s2048x1072&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=o_gqKv5d38QQ7kNvwGrxh47&_nc_oc=AdrpB7QL_pU3b6N3tpaH5qdG2D0anL2q_DXP4xhDddj2ZxpBIhnIoYcCewIn6u3_M60&_nc_zt=23&_nc_ht=scontent-mia3-3.xx&_nc_gid=RPn-oKU82s85HMVwN8954g&_nc_ss=7b289&oh=00_AQOe8C_lAr16C0-AtBbqyBUhKAxKLf1gy3Ya1rKoiZVgNg&oe=6AE73BC9',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=12.4283875%2C-86.8527031',
    coordinates: '12.4283875, -86.8527031'
  },
  {
    id: 'centro-5',
    serviceLabel: 'Atención tributaria',
    title: 'Edificio Central - Alcaldía Municipal de León',
    description: 'Sede central de la Alcaldía para recibir atención y orientación sobre los servicios tributarios municipales.',
    image: 'https://scontent-mia5-2.xx.fbcdn.net/v/t39.99422-6/789388685_1815192082973542_1054571313588336725_n.png?stp=dst-jpg_tt6&cstp=mx1599x1066&ctp=s1599x1066&_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=BTdimcd-Jz4Q7kNvwFmNTTs&_nc_oc=AdpigJop75FwQOgIn0j8Lp6ysRNptMFKlbISmHKSCGOS61BcwI-VJbQQyttWMpzkyCA&_nc_zt=14&_nc_ht=scontent-mia5-2.xx&_nc_gid=Wyae-OVUEYma3uKbK6Jjzg&_nc_ss=7b289&oh=00_AQOfn-jQ1FnmOHa3S0r8MoExqUkKDh5gKgk25b1oOtNVSQ&oe=6AC5BDD7',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=12.4354141%2C-86.8789709',
    coordinates: '12.4354141, -86.8789709'
  }
];

export const initialRedesSocialesData = {
  eyebrow: 'COMUNIDAD DIGITAL EN VIVO',
  title: 'Síguenos en Redes Sociales',
  description: 'Conéctate con la Alcaldía de León en todas nuestras plataformas oficiales para enterarte al instante de obras, noticias y eventos culturales.',
  platforms: [
    { id: 'facebook', name: 'Facebook', handle: '@AlcaldiaLeon', url: 'https://www.facebook.com/share/1EJ2g1UpjY/', icon: 'fa-facebook-f', buttonClass: 'facebook', statTarget: 15234, statLabel: 'Seguidores Facebook', color: '#1877F2', profileDescription: 'Transmisiones en directo, comunicados oficiales y avisos comunitarios.', images: ['/img/Redes sociales/captura de facebook.png', '/img/Redes sociales/captura de facebook1.png', '/img/Redes sociales/captura de facebook3.png', '/img/Redes sociales/captura de facebook4.png'] },
    { id: 'instagram', name: 'Instagram', handle: '@alcaldia_leon', url: 'https://www.instagram.com/alcaldia_leon', icon: 'fa-instagram', buttonClass: 'instagram', statTarget: 8756, statLabel: 'Seguidores Instagram', color: '#E4405F', profileDescription: 'Fotografías de León, actividades municipales y vida comunitaria.', images: ['/img/Redes sociales/instagram-1.jpg', '/img/Redes sociales/instagram-2.jpg', '/img/Redes sociales/instagram-3.jpg', '/img/Redes sociales/instagram-4.jpg', '/img/Redes sociales/instagram-5.jpg', '/img/Redes sociales/instagram-6.jpg'] },
    { id: 'tiktok', name: 'TikTok', handle: '@alcaldia_leon', url: 'https://www.tiktok.com/@leonalcaldia?_r=1&_t=ZS-98pfIgmPYhg', icon: 'fa-tiktok', buttonClass: 'tiktok', statTarget: 12345, statLabel: 'Seguidores TikTok', color: '#000000', profileDescription: 'Reportajes dinámicos, eventos culturales y resumen de obras.', images: ['/img/Redes sociales/captura de tiktok.png', '/img/Redes sociales/captura de tiktok2.png', '/img/Redes sociales/captura de tiktok3.png', '/img/Redes sociales/captura de tiktok4.png'] },
    { id: 'youtube', name: 'YouTube', handle: '@AlcaldiaLeon', url: 'https://www.youtube.com/@AlcaldiaLeon', icon: 'fa-youtube', buttonClass: 'youtube', statTarget: 5432, statLabel: 'Suscriptores YouTube', color: '#FF0000', profileDescription: 'Canal oficial de videos y transmisiones municipales.', images: [] },
    { id: 'twitter', name: 'Twitter/X', handle: '@Alcaldia_Leon', url: 'https://twitter.com/Alcaldia_Leon', icon: 'fa-twitter', buttonClass: 'twitter', statTarget: null, statLabel: '', color: '#111111', profileDescription: 'Comunicados y actualizaciones de la Alcaldía.', images: [] }
  ]
};

