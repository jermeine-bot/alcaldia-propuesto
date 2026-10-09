import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Palmtree, Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';
import { apiService } from '../../services/apiService';
import ImageUploader from '../components/ImageUploader';

const TurismoAdmin = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Patrimonio',
    location: 'León, Nicaragua',
    image: '/img/turismo/catedral.jpg',
    desc: '',
    content: ''
  });

  const { data: turismo = [], isLoading } = useQuery({
    queryKey: ['turismo'],
    queryFn: apiService.getTurismo
  });

  const saveMutation = useMutation({
    mutationFn: apiService.saveTurismo,
    onSuccess: () => {
      queryClient.invalidateQueries(['turismo']);
      setShowModal(false);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: '¡Destino Guardado!',
        text: 'El atractivo turístico ha sido guardado.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteTurismo,
    onSuccess: () => {
      queryClient.invalidateQueries(['turismo']);
      Swal.fire({
        icon: 'success',
        title: 'Destino Eliminado',
        text: 'El lugar turístico ha sido eliminado.',
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
      category: 'Patrimonio',
      location: 'León, Nicaragua',
      image: '/img/turismo/catedral.jpg',
      desc: '',
      content: ''
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
      category: item.category || 'Patrimonio',
      location: item.location || 'León, Nicaragua',
      image: item.image || item.img || '/img/turismo/catedral.jpg',
      desc: item.desc || '',
      content: item.content || item.desc || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id, title) => {
    Swal.fire({
      title: '¿Eliminar Lugar Turístico?',
      text: `¿Estás seguro de eliminar "${title}"?`,
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
        title: 'Campos Incompletos',
        text: 'Completa el título y la descripción breve.',
        confirmButtonColor: '#B22222'
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const filteredTurismo = turismo.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Palmtree className="text-danger" size={24} />
            <h5 className="admin-card-title mb-0">Gestión de Atractivos Turísticos</h5>
          </div>
          <button className="btn btn-admin-primary btn-sm d-flex align-items-center gap-2" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nuevo Destino</span>
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
                placeholder="Buscar por destino o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Grid de Destinos */}
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-danger spinner-border-sm" role="status"></div>
            <span className="ms-2 text-muted">Cargando destinos...</span>
          </div>
        ) : (
          <div className="row g-3">
            {filteredTurismo.length === 0 ? (
              <div className="col-12 text-center text-muted py-4">
                No hay destinos turísticos registrados.
              </div>
            ) : (
              filteredTurismo.map((item) => (
                <div key={item.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                  <div className="card h-100 border-0 shadow-sm overflow-hidden">
                    <img
                      src={item.image || item.img || '/img/turismo/catedral.jpg'}
                      alt={item.title}
                      className="card-img-top"
                      style={{ height: 160, objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/img/turismo/catedral.jpg';
                      }}
                    />
                    <div className="card-body p-3 d-flex flex-column">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="badge bg-danger-subtle text-danger">{item.category}</span>
                      </div>
                      <h6 className="card-title fw-bold text-dark mb-1 text-truncate" title={item.title}>{item.title}</h6>
                      <small className="text-muted mb-2 d-flex align-items-center gap-1 text-truncate">
                        <MapPin size={13} className="flex-shrink-0" />
                        <span className="text-truncate">{item.location}</span>
                      </small>
                      <p className="card-text small text-secondary flex-grow-1" style={{ fontSize: '0.82rem' }}>
                        {item.desc}
                      </p>
                      <div className="d-flex justify-content-end gap-1 pt-2 border-top">
                        <button className="btn btn-outline-secondary btn-sm py-1" onClick={() => handleOpenEdit(item)}>
                          <Edit size={14} /> Editar
                        </button>
                        <button className="btn btn-outline-danger btn-sm py-1" onClick={() => handleDelete(item.id, item.title)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                  {editingItem ? 'Editar Destino Turístico' : 'Agregar Nuevo Destino'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold small">Nombre del Destino</label>
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
                        <option value="Patrimonio">Patrimonio Cultural</option>
                        <option value="Volcanes">Aventura & Volcanes</option>
                        <option value="Playas">Playas & Costa</option>
                        <option value="Historia">Historia & Arte</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Ubicación</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <ImageUploader
                        label="Imagen del Destino Turístico"
                        value={formData.image}
                        onChange={(img) => setFormData({ ...formData, image: img })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Descripción Breve (Tarjeta)</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.desc}
                        onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Reseña o Información Detallada</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-admin-primary btn-sm" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar Destino'}
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

export default TurismoAdmin;
