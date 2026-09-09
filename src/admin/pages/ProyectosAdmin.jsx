import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Building2, Plus, Edit, Trash2, Search, CheckCircle2, Clock } from 'lucide-react';
import { apiService } from '../../services/apiService';
import ImageUploader from '../components/ImageUploader';

const ProyectosAdmin = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Vialidad',
    progress: 50,
    cost: 'C$ 10.0M',
    location: 'León, Nicaragua',
    image: '/img/proyectos/proyecto1.jpg',
    desc: '',
    beneficiaries: '20,000 Habitantes',
    start_date: 'Enero 2026'
  });

  const { data: proyectos = [], isLoading } = useQuery({
    queryKey: ['proyectos'],
    queryFn: apiService.getProyectos
  });

  const saveMutation = useMutation({
    mutationFn: apiService.saveProyecto,
    onSuccess: () => {
      queryClient.invalidateQueries(['proyectos']);
      setShowModal(false);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: '¡Obra Guardada!',
        text: 'El proyecto municipal ha sido registrado/actualizado.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteProyecto,
    onSuccess: () => {
      queryClient.invalidateQueries(['proyectos']);
      Swal.fire({
        icon: 'success',
        title: 'Proyecto Eliminado',
        text: 'El proyecto ha sido removido.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Vialidad',
      progress: 50,
      cost: 'C$ 10.0M',
      location: 'León, Nicaragua',
      image: '/img/proyectos/proyecto1.jpg',
      desc: '',
      beneficiaries: '20,000 Habitantes',
      start_date: 'Enero 2026'
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      title: item.title || '',
      category: item.category || 'Vialidad',
      progress: item.progress ?? 50,
      cost: item.cost || 'C$ 10.0M',
      location: item.location || 'León, Nicaragua',
      image: item.image || item.img || '/img/proyectos/proyecto1.jpg',
      desc: item.desc || item.summary || '',
      beneficiaries: item.beneficiaries || '20,000 Habitantes',
      start_date: item.start_date || 'Enero 2026'
    });
    setShowModal(true);
  };

  const handleDelete = (id, title) => {
    Swal.fire({
      title: '¿Eliminar Proyecto?',
      text: `¿Estás seguro de eliminar el proyecto "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B22222',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.desc) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Requeridos',
        text: 'Por favor completa el nombre de la obra y su descripción.',
        confirmButtonColor: '#B22222'
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const filteredProyectos = proyectos.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Building2 className="text-danger" size={24} />
            <h5 className="admin-card-title mb-0">Gestión de Proyectos y Obras Municipales</h5>
          </div>
          <button className="btn btn-admin-primary btn-sm d-flex align-items-center gap-2" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nuevo Proyecto</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="row mb-3 g-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Buscar por obra o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-danger spinner-border-sm" role="status"></div>
            <span className="ms-2 text-muted">Cargando proyectos...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table align-middle">
              <thead>
                <tr>
                  <th style={{ minWidth: '60px' }}>Imagen</th>
                  <th style={{ minWidth: '200px' }}>Proyecto y Ubicación</th>
                  <th style={{ minWidth: '120px' }}>Categoría</th>
                  <th style={{ minWidth: '110px' }}>Monto Inversión</th>
                  <th style={{ minWidth: '140px' }}>Avance (%)</th>
                  <th style={{ minWidth: '110px' }}>Estado</th>
                  <th className="text-end" style={{ minWidth: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProyectos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No hay proyectos registrados.
                    </td>
                  </tr>
                ) : (
                  filteredProyectos.map((item) => {
                    const isCompleted = Number(item.progress) === 100;
                    const imgSrc = item.image || item.img || '/img/proyectos/proyecto1.jpg';
                    return (
                      <tr key={item.id}>
                        <td>
                          <img
                            src={imgSrc}
                            alt={item.title}
                            className="rounded flex-shrink-0"
                            style={{ width: 44, height: 44, objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/img/proyectos/proyecto1.jpg';
                            }}
                          />
                        </td>
                        <td>
                          <div className="fw-semibold text-dark mb-1 text-truncate" style={{ maxWidth: 260 }} title={item.title}>
                            {item.title}
                          </div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: 260 }} title={item.location}>
                            {item.location}
                          </small>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border text-nowrap">{item.category}</span>
                        </td>
                        <td className="fw-bold text-danger small text-nowrap">
                          {item.cost || 'N/A'}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: 8 }}>
                              <div
                                className={`progress-bar ${isCompleted ? 'bg-success' : 'bg-danger'}`}
                                role="progressbar"
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                            <span className="small fw-bold text-nowrap">{item.progress}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge-status text-nowrap ${isCompleted ? 'badge-status-published' : 'badge-status-progress'}`}>
                            {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {isCompleted ? 'Completado' : 'En Progreso'}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-secondary" title="Editar" onClick={() => handleOpenEdit(item)}>
                              <Edit size={15} />
                            </button>
                            <button className="btn btn-outline-danger" title="Eliminar" onClick={() => handleDelete(item.id, item.title)}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold">
                  {editingItem ? 'Editar Obra Municipal' : 'Registrar Nueva Obra'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold small">Nombre del Proyecto</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Categoría</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Infraestructura">Infraestructura</option>
                        <option value="Comercio & Economía">Comercio & Economía</option>
                        <option value="Vialidad">Vialidad</option>
                        <option value="Cultura & Turismo">Cultura & Turismo</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Ubicación Exacta</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold small">Porcentaje de Avance (0 - 100%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="form-control"
                        value={formData.progress}
                        onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold small">Inversión (Ej: C$ 45.2M)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-8">
                      <ImageUploader
                        label="Imagen Representativa de la Obra"
                        value={formData.image}
                        onChange={(img) => setFormData({ ...formData, image: img })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Población Beneficiada</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.beneficiaries}
                        onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Descripción de la Obra</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.desc}
                        onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-admin-primary btn-sm" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar Proyecto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProyectosAdmin;
