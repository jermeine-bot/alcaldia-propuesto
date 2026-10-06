
START TRANSACTION;

-- ---------- TABLE LOGIN -----------
CREATE TABLE Login (
    password    VARCHAR(255) NOT NULL, -- Almacenará el Hash de la contraseña (ej. Bcrypt)
    correo      VARCHAR(150) NOT NULL UNIQUE,
    
    CONSTRAINT pk_Login PRIMARY KEY (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar usuario y contraseña por defecto (Protegido: contraseña hasheada de ejemplo para "Admin123*")
INSERT INTO Login (password, correo) 
VALUES ('Telematica2022#', 'admin@gobierno.gob');


-- ---------- TABLE PORTADA_HERO -----------
CREATE TABLE Portada_Hero (
    id_portada            INT AUTO_INCREMENT,
    encabezado            VARCHAR(150),
    titulo_portada        VARCHAR(200),
    subtitulo_descriptivo TEXT,
    ruta_video            VARCHAR(255),
    imagen                VARCHAR(255),
    
    CONSTRAINT pk_Portada_Hero PRIMARY KEY (id_portada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE NOTICIAS (Relacionada con Login) -----------
CREATE TABLE Noticias (
    id_noticia      INT AUTO_INCREMENT,
    titulo_Noticia  VARCHAR(255) NOT NULL,
    categoria       VARCHAR(100),
    estado          BOOLEAN DEFAULT TRUE,
    imagen          VARCHAR(255),
    resumen_corto   VARCHAR(500),
    contenido       TEXT,
    usuario_creador VARCHAR(150), -- Relación con el usuario que publicó la noticia
    
    CONSTRAINT pk_Noticias PRIMARY KEY (id_noticia),
    CONSTRAINT fk_noticia_usuario FOREIGN KEY (usuario_creador) REFERENCES Login(correo) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE TURISMO -----------
CREATE TABLE Turismo (
    id_destino      INT AUTO_INCREMENT,
    nombre_destino  VARCHAR(100) NOT NULL,
    categoria       VARCHAR(100),
    ubicacion       VARCHAR(255),
    img             VARCHAR(255),
    description     TEXT,
    info_resena     TEXT,
    
    CONSTRAINT pk_Turismo PRIMARY KEY (id_destino)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE PROYECTOS (Relacionada con Login) -----------
CREATE TABLE Proyectos (
    id_proyecto           INT AUTO_INCREMENT,
    nombre_proyecto       VARCHAR(150) NOT NULL,
    categoria             VARCHAR(100),
    ubicacion             VARCHAR(255),
    porcentaje_avance     INT DEFAULT 0,
    inversion             DECIMAL(12, 2),
    img                   VARCHAR(255),
    poblacion_beneficiada INT,
    descripcion           TEXT,
    usuario_creador       VARCHAR(150),
    
    CONSTRAINT pk_Proyectos PRIMARY KEY (id_proyecto),
    CONSTRAINT fk_proyecto_usuario FOREIGN KEY (usuario_creador) REFERENCES Login(correo) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE CULTURA -----------
CREATE TABLE cultura (
    id_cultura    INT AUTO_INCREMENT,
    nombre        VARCHAR(150) NOT NULL,
    icono         VARCHAR(100),
    fecha_evento  DATE,
    hora          TIME,
    sede          VARCHAR(150),
    img           VARCHAR(255),
    descripcion   TEXT,
    
    CONSTRAINT pk_cultura PRIMARY KEY (id_cultura)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE CENTROS_DE_ATENCION -----------
CREATE TABLE centros_de_atencion (
    id_centro     INT AUTO_INCREMENT,
    nombre        VARCHAR(150) NOT NULL,
    url_foto      VARCHAR(255),
    etiqueta      VARCHAR(100),
    descripcion   TEXT,
    map           VARCHAR(255),
    coordenadas   VARCHAR(100),
    
    CONSTRAINT pk_centros_de_atencion PRIMARY KEY (id_centro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE ESTADISTICA -----------
CREATE TABLE Estadistica (
    id_estadistica        INT AUTO_INCREMENT,
    titulo                VARCHAR(150),
    categoria             VARCHAR(100),
    valorNumerico         INT,
    sufijo                VARCHAR(20),
    etiqueta              VARCHAR(100),
    color_Hexadecimal     VARCHAR(7),
    icono                 VARCHAR(100),
    porcentaje            INT,
    subtitulo_explicativo VARCHAR(255),
    descripcion           TEXT,
    
    CONSTRAINT pk_Estadistica PRIMARY KEY (id_estadistica)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE REDES -----------
CREATE TABLE Redes (
    id_red        INT AUTO_INCREMENT,
    nombre        VARCHAR(50),
    seguidores    VARCHAR(50),
    usuarios      VARCHAR(100),
    url           VARCHAR(255),
    text_contador VARCHAR(100),
    color         VARCHAR(50),
    text_perfil   VARCHAR(100),
    imagenGaleria VARCHAR(255),
    
    CONSTRAINT pk_Redes PRIMARY KEY (id_red)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE REDES_SOCIALES -----------
CREATE TABLE Redes_sociales (
    id_seccion        INT AUTO_INCREMENT,
    etiqueta_seccion  VARCHAR(100),
    titulo            VARCHAR(150),
    descripcion       TEXT,
    
    CONSTRAINT pk_Redes_sociales PRIMARY KEY (id_seccion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE TRAMITES -----------
CREATE TABLE tramites (
    id_tramite        INT AUTO_INCREMENT,
    etiqueta_superior VARCHAR(100),
    titulo_principal  VARCHAR(150),
    descripcion       TEXT,
    telefono          VARCHAR(30),
    
    CONSTRAINT pk_tramites PRIMARY KEY (id_tramite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE CONTACTO -----------
CREATE TABLE contacto (
    id_contacto   INT AUTO_INCREMENT,
    telefono      VARCHAR(30),
    horario       VARCHAR(150),
    correo        VARCHAR(150),
    Direccion     VARCHAR(255),
    facebookUrl   VARCHAR(255),
    instagramUrl  VARCHAR(255),
    youtubeUrl    VARCHAR(255),
    XUrl          VARCHAR(255),
    
    CONSTRAINT pk_contacto PRIMARY KEY (id_contacto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE CATEGORIA_TRAMITES -----------
CREATE TABLE categoria_tramites (
    id_categoria      INT AUTO_INCREMENT,
    titulo            VARCHAR(150),
    emoji             VARCHAR(10),
    subtitulo_resumen VARCHAR(255),
    icon_font         VARCHAR(100),
    detalles          TEXT,
    
    CONSTRAINT pk_categoria_tramites PRIMARY KEY (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ---------- TABLE AGREGAR_TRAMITE -----------
CREATE TABLE agregar_tramite (
    id_agregar_tramite INT AUTO_INCREMENT,
    nombre             VARCHAR(150),
    descripcion        TEXT,
    texto_boton        VARCHAR(50),
    url_destino        VARCHAR(255),
    icon               VARCHAR(100),
    
    CONSTRAINT pk_agregar_tramite PRIMARY KEY (id_agregar_tramite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;