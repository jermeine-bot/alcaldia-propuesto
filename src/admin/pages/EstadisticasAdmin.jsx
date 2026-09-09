import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { BarChart3, Plus, Edit, Trash2, Search, Sliders } from 'lucide-react';
import { apiService } from '../../services/apiService';

const EstadisticasAdmin = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: 'Demografía',
    number: 210500,
    suffix: '+',
    badge: 'Población',
    percentage: 85,
    color: '#B22222',
    icon: 'fa-users',
    descripcion: ''
  });

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: apiService.getStats
  });

  const saveMutation = useMutation({
    mutationFn: apiService.saveStat,
    onSuccess: () => {
      queryClient.invalidateQueries(['stats']);
      setShowModal(false);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: '¡Indicador Guardado!',
        text: 'La estadística de León se ha actualizado.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteStat,
    onSuccess: () => {
      queryClient.invalidateQueries(['stats']);
      Swal.fire({
        icon: 'success',
        title: 'Indicador Eliminado',
        text: 'La cifra estadística ha sido removida.',
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
      subtitle: '',
      category: 'Demografía',
      number: 210500,
      suffix: '+',
      badge: 'Población',
      percentage: 85,
      color: '#B22222',
      icon: 'fa-users',
      descripcion: ''
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
      subtitle: item.subtitle || '',
      category: item.category || 'Demografía',
      number: item.number ?? 100,
      suffix: item.suffix || '',
      badge: item.badge || '',
      percentage: item.percentage ?? 50,
      color: item.color || '#B22222',
      icon: item.icon || 'fa-chart-bar',
      descripcion: item.detalles?.descripcion || item.subtitle || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id, title) => {
    Swal.fire({
      title: '¿Eliminar Indicador?',
      text: `¿Estás seguro de eliminar el indicador "${title}"?`,
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
    if (!formData.title) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'El título del indicador es obligatorio.',
        confirmButtonColor: '#B22222'
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const filteredStats = stats.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <BarChart3 className="text-danger" size={24} />
            <h5 className="admin-card-title mb-0">Indicadores y Cifras de León</h5>
          </div>
          <button className="btn btn-admin-primary btn-sm d-flex align-items-center gap-2" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nuevo Indicador</span>
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
                placeholder="Buscar por indicador..."
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
            <span className="ms-2 text-muted">Cargando estadísticas...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table align-middle">
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Categoría</th>
                  <th>Valor Numérico</th>
                  <th>Sufijo</th>
                  <th>Color</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No hay estadísticas registradas.
                    </td>
                  </tr>
                ) : (
                  filteredStats.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded d-flex align-items-center justify-content-center text-white"
                            style={{ width: 32, height: 32, backgroundColor: item.color || '#B22222', fontSize: '0.85rem' }}
                          >
                            <i className={`fas ${item.icon || 'fa-chart-bar'}`}></i>
                          </div>
                          <div>
                            <div className="fw-semibold text-dark">{item.title}</div>
                            <small className="text-muted">{item.subtitle}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{item.category}</span>
                      </td>
                      <td className="fw-bold fs-6">
                        {item.number?.toLocaleString() || item.number}
                      </td>
                      <td className="fw-semibold text-danger">
                        {item.suffix}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="rounded-circle d-inline-block"
                            style={{ width: 14, height: 14, backgroundColor: item.color || '#B22222' }}
                          ></span>
                          <small className="text-muted">{item.color}</small>
                        </div>
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
                  ))
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
                  {editingItem ? 'Editar Indicador Estadístico' : 'Agregar Nuevo Indicador'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold small">Título del Indicador</label>
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
                        <option value="Demografía">Demografía</option>
                        <option value="Geografía">Geografía</option>
                        <option value="Cultura">Cultura</option>
                        <option value="Desarrollo">Desarrollo</option>
                        <option value="Servicios">Servicios</option>
                        <option value="Turismo">Turismo</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Valor Numérico Principal</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Sufijo / Unidad (Ej: +, km², %)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.suffix}
                        onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Etiqueta Badge</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Color Hexadecimal</label>
                      <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Icono FontAwesome</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="fa-users"
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Porcentaje de Barra (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="form-control"
                        value={formData.percentage}
                        onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Subtítulo Explicativo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Descripción Detallada (Para Modal)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-admin-primary btn-sm" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar Indicador'}
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

export default EstadisticasAdmin;
