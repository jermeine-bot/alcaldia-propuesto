import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  Building2,
  Palmtree,
  CalendarDays,
  PlusCircle,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const DashboardOverview = () => {
  const { data: noticias = [] } = useQuery({
    queryKey: ['noticias'],
    queryFn: apiService.getNoticias
  });

  const { data: proyectos = [] } = useQuery({
    queryKey: ['proyectos'],
    queryFn: apiService.getProyectos
  });

  const { data: turismo = [] } = useQuery({
    queryKey: ['turismo'],
    queryFn: apiService.getTurismo
  });

  const { data: cultura = [] } = useQuery({
    queryKey: ['cultura'],
    queryFn: apiService.getCultura
  });

  const proyectosEnProgreso = proyectos.filter((p) => Number(p.progress) < 100);
  const proyectosCompletados = proyectos.filter((p) => Number(p.progress) === 100);

  return (
    <div className="container-fluid px-0">
      {/* Banner de bienvenida */}
      <div className="admin-card bg-white border-0 shadow-sm mb-4">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '1.25rem' }}>
              ¡Bienvenido al Panel de Control de León! 🏛️
            </h3>
            <p className="text-muted mb-0 small">
              Administración de obras, noticias, turismo y contenidos institucionales de la ciudad.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card-widget">
            <div className="stat-widget-icon bg-danger-subtle text-danger flex-shrink-0">
              <Newspaper size={24} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-semibold text-truncate">Noticias Publicadas</div>
              <div className="h3 fw-bold mb-0">{noticias.length}</div>
              <small className="text-success fw-semibold d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                <TrendingUp size={12} className="me-1" />
                Actualizado en tiempo real
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card-widget">
            <div className="stat-widget-icon bg-primary-subtle text-primary flex-shrink-0">
              <Building2 size={24} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-semibold text-truncate">Obras y Proyectos</div>
              <div className="h3 fw-bold mb-0">{proyectos.length}</div>
              <small className="text-primary fw-semibold d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                {proyectosEnProgreso.length} en progreso, {proyectosCompletados.length} listos
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card-widget">
            <div className="stat-widget-icon bg-warning-subtle text-warning flex-shrink-0">
              <Palmtree size={24} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-semibold text-truncate">Destinos Turísticos</div>
              <div className="h3 fw-bold mb-0">{turismo.length}</div>
              <small className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                Catedral, Volcanes, Playas
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card-widget">
            <div className="stat-widget-icon bg-success-subtle text-success flex-shrink-0">
              <CalendarDays size={24} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-semibold text-truncate">Agenda Cultural</div>
              <div className="h3 fw-bold mb-0">{cultura.length}</div>
              <small className="text-success fw-semibold d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                Tradiciones y Festivales
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos y Tablas de Resumen */}
      <div className="row g-4">
        {/* Proyectos Recientes con Avance % */}
        <div className="col-12 col-lg-7">
          <div className="admin-card h-100 mb-0">
            <div className="admin-card-header flex-wrap gap-2">
              <h5 className="admin-card-title d-flex align-items-center gap-2">
                <Building2 size={20} className="text-danger flex-shrink-0" />
                <span>Avance de Obras Municipales</span>
              </h5>
              <Link to="/admin/proyectos" className="btn btn-sm btn-outline-danger text-nowrap">
                Gestionar Todos
              </Link>
            </div>
            <div className="table-responsive">
              <table className="admin-table align-middle">
                <thead>
                  <tr>
                    <th style={{ minWidth: '180px' }}>Proyecto</th>
                    <th style={{ minWidth: '110px' }}>Categoría</th>
                    <th style={{ minWidth: '130px' }}>Progreso</th>
                    <th style={{ minWidth: '110px' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectos.slice(0, 4).map((p) => {
                    const isCompleted = Number(p.progress) === 100;
                    const imgSrc = p.image || p.img || '/img/proyectos/proyecto1.jpg';
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                            <img
                              src={imgSrc}
                              alt={p.title}
                              className="rounded flex-shrink-0"
                              style={{ width: 40, height: 40, objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/img/proyectos/proyecto1.jpg';
                              }}
                            />
                            <div className="overflow-hidden" style={{ minWidth: 0, maxWidth: 200 }}>
                              <div className="fw-semibold text-dark text-truncate" title={p.title}>
                                {p.title}
                              </div>
                              <small className="text-muted d-block text-truncate" title={p.location}>
                                {p.location}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border text-nowrap">{p.category}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: 8 }}>
                              <div
                                className={`progress-bar ${isCompleted ? 'bg-success' : 'bg-danger'}`}
                                role="progressbar"
                                style={{ width: `${p.progress}%` }}
                              ></div>
                            </div>
                            <span className="small fw-bold text-nowrap">{p.progress}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge-status text-nowrap ${isCompleted ? 'badge-status-published' : 'badge-status-progress'}`}>
                            {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {isCompleted ? 'Completado' : 'En Progreso'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Noticias Recientes & Accesos Rápidos */}
        <div className="col-12 col-lg-5">
          <div className="admin-card mb-4">
            <div className="admin-card-header flex-wrap gap-2">
              <h5 className="admin-card-title d-flex align-items-center gap-2">
                <Newspaper size={20} className="text-danger flex-shrink-0" />
                <span>Últimas Noticias</span>
              </h5>
              <Link to="/admin/noticias" className="btn btn-sm btn-outline-danger text-nowrap">
                Nueva Noticia
              </Link>
            </div>
            <div className="list-group list-group-flush">
              {noticias.slice(0, 3).map((n) => {
                const imgSrc = n.image || n.img || '/img/noticias/noticia1.jpg';
                return (
                  <div key={n.id} className="list-group-item px-0 py-2 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={imgSrc}
                        alt={n.title}
                        className="rounded flex-shrink-0"
                        style={{ width: 44, height: 44, objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/img/noticias/noticia1.jpg';
                        }}
                      />
                      <div className="overflow-hidden" style={{ minWidth: 0 }}>
                        <div className="fw-semibold text-dark text-truncate" title={n.title}>
                          {n.title}
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-1" style={{ fontSize: '0.75rem' }}>
                          <span className="badge bg-danger-subtle text-danger text-nowrap">{n.category}</span>
                          <span className="text-muted text-nowrap">{n.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tarjeta de Gestión Rápida */}
          <div className="admin-card bg-light border mb-0">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <PlusCircle size={18} className="text-danger flex-shrink-0" />
              <span>Acciones de Gestión Rápida</span>
            </h6>
            <div className="d-grid gap-2">
              <Link to="/admin/hero" className="btn btn-white btn-sm text-start border shadow-sm d-flex align-items-center justify-content-between">
                <span>Editar Portada y Video Hero</span>
                <ExternalLink size={14} />
              </Link>
              <Link to="/admin/estadisticas" className="btn btn-white btn-sm text-start border shadow-sm d-flex align-items-center justify-content-between">
                <span>Actualizar Indicadores de León</span>
                <ExternalLink size={14} />
              </Link>
              <Link to="/admin/contacto" className="btn btn-white btn-sm text-start border shadow-sm d-flex align-items-center justify-content-between">
                <span>Configurar Teléfonos y Redes Sociales</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
