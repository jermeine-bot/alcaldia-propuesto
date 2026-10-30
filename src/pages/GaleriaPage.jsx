import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async'; // 1. Importamos Helmet
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchModal from '../components/SearchModal';
import { apiService } from '../services/apiService';

const FALLBACK_IMAGE = '/img/galeria/default-gallery.jpg';

// Categorías predefinidas comunes con íconos sugeridos
const CATEGORIAS_GALERIA = [
  { id: 'Todas', label: 'Todas', icon: 'fas fa-th-large' },
  { id: 'Parques', label: 'Parques y Plazas', icon: 'fas fa-tree' },
  { id: 'Playas', label: 'Playas y Naturaleza', icon: 'fas fa-umbrella-beach' },
  { id: 'Historia', label: 'Patrimonio e Historia', icon: 'fas fa-landmark' },
  { id: 'Cultura', label: 'Cultura y Tradición', icon: 'fas fa-masks-theater' },
  { id: 'Obras', label: 'Proyectos u Obras', icon: 'fas fa-building-flag' },
  { id: 'Otras', label: 'Otras', icon: 'fas fa-images' }
];

const GaleriaPage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Consulta al CMS a través del apiService para traer la galería de imágenes
  const { data: galeria = [], isLoading, isError, error } = useQuery({
    queryKey: ['galeria'],
    queryFn: apiService.getGaleria || apiService.getGallery
  });

  // 2. Simplificamos el useEffect (manejamos el scroll y dejamos que Helmet controle el SEO)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Normalizar categorías del CMS para que coincidan con las estándar si aplican
  const normalizeCategory = (catStr) => {
    if (!catStr) return 'Otras';
    const clean = catStr.trim().toLowerCase();
    if (clean.includes('parque') || clean.includes('plaza')) return 'Parques';
    if (clean.includes('playa') || clean.includes('costa') || clean.includes('naturaleza')) return 'Playas';
    if (clean.includes('historia') || clean.includes('patrimonio') || clean.includes('monumento')) return 'Historia';
    if (clean.includes('cultura') || clean.includes('tradicion') || clean.includes('fiesta')) return 'Cultura';
    if (clean.includes('obra') || clean.includes('infraestructura') || clean.includes('proyecto')) return 'Obras';
    return 'Otras';
  };

  // Estadísticas de la galería
  const stats = useMemo(() => {
    return {
      total: galeria.length
    };
  }, [galeria]);

  // Filtrado de fotos por categoría y término de búsqueda
  const filteredPhotos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return galeria.filter((item) => {
      const rawCat = item.category || item.categoria || item.tag || '';
      const catNormalized = normalizeCategory(rawCat);

      // Filtro de categoría
      const matchesCategory =
        activeCategory === 'Todas' ||
        catNormalized.toLowerCase() === activeCategory.toLowerCase() ||
        rawCat.toLowerCase().includes(activeCategory.toLowerCase());

      // Filtro de texto
      const searchable = [
        item.title,
        item.titulo,
        item.description,
        item.descripcion,
        item.location,
        item.lugar,
        rawCat
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesCategory && (!term || searchable.includes(term));
    });
  }, [galeria, activeCategory, searchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
    setActiveCategory('Todas');
  };

  return (
    <div className="app-container galeria-page">
      {/* 3. Agregamos Helmet con el título y meta descripciones oficiales */}
      <Helmet>
        <title>Galería Fotográfica | Alcaldía de León</title>
        <meta
          name="description"
          content="Explora el archivo visual y fotográfico oficial de la Alcaldía Municipal de León, Nicaragua. Parques, playas, patrimonio histórico, cultura y obras."
        />
        <meta property="og:title" content="Galería Fotográfica | Alcaldía de León" />
        <meta
          property="og:description"
          content="Descubre la riqueza paisajística, histórica y cultural de León a través de nuestro álbum fotográfico oficial."
        />
      </Helmet>

      <Header onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main>
        {/* PORTADA / HERO DE GALERÍA */}
        <section className="proyectos-page-hero">
          <div className="proyectos-page-hero-overlay"></div>
          <div className="container position-relative">
            <nav className="proyectos-breadcrumb" aria-label="Ruta de navegación">
              <Link to="/"><i className="fas fa-home me-2"></i>Inicio</Link>
              <i className="fas fa-chevron-right mx-2 small"></i>
              <span>Galería Fotográfica</span>
            </nav>

            <div className="row align-items-end g-4">
              <div className="col-lg-8">
                <span className="proyectos-page-eyebrow">Archivo Visual Municipal</span>
                <h1 className="proyectos-page-title">
                  Galería de <span>León</span>
                </h1>
                <p className="proyectos-page-lead">
                  Explora la riqueza paisajística, histórica y cultural de León a través de nuestro archivo fotográfico oficial.
                </p>
                <div className="d-flex flex-wrap gap-3 pt-2">
                  <a href="#galeria-fotos" className="btn btn-danger rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2">
                    Ver imágenes
                    <i className="fas fa-arrow-down small"></i>
                  </a>
                  <Link to="/#contacto" className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold">
                    Contactar Alcaldía
                  </Link>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="proyectos-page-hero-note">
                  <i className="fas fa-camera-retro"></i>
                  <div>
                    <strong>Galería Municipal</strong>
                    <span>{stats.total} Fotografías</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LISTADO / REJILLA DE GALERÍA */}
        <section id="galeria-fotos" className="proyectos-page-list">
          <div className="container">
            <div className="proyectos-page-heading text-center text-md-start mb-4">
              <span className="section-subtitle">Recorrido Fotográfico</span>
              <h2 className="section-title mb-1">Álbum de la Ciudad</h2>
              <p className="text-muted mb-0">
                Filtra por categorías para descubrir parques, playas, patrimonio histórico y costumbres leonesas.
              </p>
            </div>

            {/* BOTONES DE FILTRO POR CATEGORÍA */}
            <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start mb-4">
              {CATEGORIAS_GALERIA.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`btn rounded-pill px-3 py-2 btn-sm fw-semibold transition-all ${
                    activeCategory === cat.id
                      ? 'btn-danger shadow-sm'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <i className={`${cat.icon} me-2`}></i>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="proyectos-page-toolbar mb-4">
              <div className="row g-3 align-items-center">
                <div className="col-12 col-md-8 col-lg-9">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="search"
                      className="form-control border-start-0 ps-0"
                      placeholder="Buscar fotografía por título, lugar o palabra clave..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-4 col-lg-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={clearFilters}
                    disabled={activeCategory === 'Todas' && !searchTerm.trim()}
                  >
                    <i className="fas fa-eraser me-2"></i>Restablecer filtros
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-2 border-top text-muted small">
                Mostrando <strong className="text-dark">{filteredPhotos.length}</strong> de{' '}
                <strong className="text-dark">{galeria.length}</strong> fotografías
              </div>
            </div>

            {/* ESTADOS DE CARGA Y RESULTADOS */}
            {isLoading ? (
              <div className="proyectos-page-empty">
                <div className="spinner-border text-danger mb-3" role="status"></div>
                <p className="text-muted mb-0">Cargando fotos del CMS...</p>
              </div>
            ) : isError ? (
              <div className="proyectos-page-empty">
                <i className="fas fa-triangle-exclamation text-danger"></i>
                <h3>No se pudieron cargar las fotografías</h3>
                <p className="text-muted">{error?.message || 'Intenta recargar la página más tarde.'}</p>
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className="proyectos-page-empty">
                <i className="fas fa-images text-muted"></i>
                <h3>No hay fotos en esta categoría</h3>
                <p className="text-muted">Prueba con otra búsqueda o restablece los filtros.</p>
                <button type="button" className="btn btn-danger rounded-pill px-4" onClick={clearFilters}>
                  Ver todas las fotos
                </button>
              </div>
            ) : (
              /* Mosaico de Fotografías */
              <div className="row g-4">
                {filteredPhotos.map((item, index) => {
                  const imageSrc = item.image_url || item.url || item.image || item.foto || FALLBACK_IMAGE;
                  const title = item.title || item.titulo || 'Fotografía de León';
                  const rawCategory = item.category || item.categoria || item.tag || 'Otras';
                  const location = item.location || item.lugar || null;
                  const description = item.description || item.descripcion || '';

                  return (
                    <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={item.id || index}>
                      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden gallery-card group">
                        <div
                          className="position-relative overflow-hidden cursor-pointer"
                          style={{ height: '230px', backgroundColor: '#e9ecef' }}
                          onClick={() => setSelectedPhoto(item)}
                        >
                          <img
                            src={imageSrc}
                            alt={title}
                            className="w-100 h-100 object-fit-cover transition-transform"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                          />
                          <div className="gallery-card-overlay d-flex flex-column justify-content-between p-3 position-absolute top-0 start-0 w-100 h-100">
                            <span className="badge bg-danger rounded-pill align-self-start px-3 py-2 shadow-sm">
                              {rawCategory}
                            </span>
                            <div className="text-white">
                              <i className="fas fa-search-plus fs-4 mb-1"></i>
                              <p className="mb-0 small fw-semibold">Click para ampliar</p>
                            </div>
                          </div>
                        </div>

                        <div className="card-body p-3 d-flex flex-column">
                          <h3 className="h6 card-title fw-bold text-dark mb-1 text-truncate" title={title}>
                            {title}
                          </h3>
                          {location && (
                            <p className="text-danger small mb-2">
                              <i className="fas fa-map-marker-alt me-1"></i> {location}
                            </p>
                          )}
                          {description && (
                            <p className="text-muted small mb-0 text-truncate" title={description}>
                              {description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* MODAL PARA AMPLIAR LA FOTO */}
      {selectedPhoto && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg bg-dark text-white rounded-4 overflow-hidden">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-truncate pe-3">
                  <i className="fas fa-image me-2 text-danger"></i>
                  {selectedPhoto.title || selectedPhoto.titulo || 'Fotografía'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedPhoto(null)}
                ></button>
              </div>

              <div className="modal-body text-center p-3">
                <img
                  src={selectedPhoto.image_url || selectedPhoto.url || selectedPhoto.image || selectedPhoto.foto || FALLBACK_IMAGE}
                  alt={selectedPhoto.title || selectedPhoto.titulo}
                  className="img-fluid rounded-3 shadow"
                  style={{ maxHeight: '70vh', objectFit: 'contain', width: '100%' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              <div className="modal-footer border-top-0 pt-0 justify-content-between">
                <div>
                  {(selectedPhoto.location || selectedPhoto.lugar) && (
                    <span className="text-danger-subtle small me-3">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {selectedPhoto.location || selectedPhoto.lugar}
                    </span>
                  )}
                  {(selectedPhoto.category || selectedPhoto.categoria) && (
                    <span className="badge bg-danger">
                      {selectedPhoto.category || selectedPhoto.categoria}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-outline-light rounded-pill px-4 btn-sm"
                  onClick={() => setSelectedPhoto(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaPage;