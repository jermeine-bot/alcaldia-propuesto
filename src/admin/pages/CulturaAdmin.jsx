import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { CalendarDays, Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';
import { apiService } from '../../services/apiService';
import ImageUploader from '../components/ImageUploader';

const CulturaAdmin = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    icon: 'fa-cross',
    event_date: 'Marzo - Abril',
    event_time: 'Todo el día',
    location: 'León, Nicaragua',
    image: '/img/noticias/festival de la poseia.jpg',
    desc: ''
  });

  const { data: cultura = [], isLoading } = useQuery({
    queryKey: ['cultura'],
    queryFn: apiService.getCultura
  });

  const saveMutation = useMutation({
    mutationFn: apiService.saveCultura,
    onSuccess: () => {
      queryClient.invalidateQueries(['cultura']);
      setShowModal(false);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: '¡Evento Guardado!',
        text: 'El evento cultural ha sido guardado.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteCultura,
    onSuccess: () => {
      queryClient.invalidateQueries(['cultura']);
      Swal.fire({
        icon: 'success',
        title: 'Evento Eliminado',
        text: 'El evento ha sido eliminado.',
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
      icon: 'fa-cross',
      event_date: 'Marzo - Abril',
      event_time: 'Todo el día',
      location: 'León, Nicaragua',
      image: '/img/noticias/festival de la poseia.jpg',
      desc: ''
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
      icon: item.icon || 'fa-cross',
      event_date: item.event_date || item.date || 'Marzo - Abril',
      event_time: item.event_time || 'Todo el día',
      location: item.location || 'León, Nicaragua',
      image: item.image || item.image_url || item.img || '/img/noticias/festival de la poseia.jpg',
      desc: item.desc || item.summary || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id, title) => {
    Swal.fire({
      title: '¿Eliminar Evento?',
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
        text: 'El título y la descripción son requeridos.',
        confirmButtonColor: '#B22222'
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const filteredCultura = cultura.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <CalendarDays className="text-danger" size={24} />
            <h5 className="admin-card-title mb-0">Agenda Cultural y Tradiciones de León</h5>
          </div>
          <button className="btn btn-admin-primary btn-sm d-flex align-items-center gap-2" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nuevo Evento / Tradición</span>
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
                placeholder="Buscar por evento..."
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
            <span className="ms-2 text-muted">Cargando eventos...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table align-middle">
              <thead>
                <tr>
                  <th style={{ minWidth: '60px' }}>Imagen</th>
                  <th style={{ minWidth: '220px' }}>Evento / Tradición</th>
                  <th style={{ minWidth: '130px' }}>Fecha & Hora</th>
                  <th style={{ minWidth: '130px' }}>Lugar</th>
                  <th className="text-end" style={{ minWidth: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCultura.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No hay eventos culturales registrados.
                    </td>
                  </tr>
                ) : (
                  filteredCultura.map((item) => {
                    const imgSrc = item.image || item.image_url || item.img || '/img/noticias/festival de la poseia.jpg';
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
                              e.target.src = '/img/noticias/festival de la poseia.jpg';
                            }}
                          />
                        </td>
                        <td>
                          <div className="fw-semibold text-dark mb-1 d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: 260 }} title={item.title}>
                            <i className={`fas ${item.icon || 'fa-star'} text-danger flex-shrink-0`}></i>
                            <span className="text-truncate">{item.title}</span>
                          </div>
                          <small className="text-muted d-block text-truncate" style={{ maxWidth: 260 }} title={item.desc}>
                            {item.desc}
                          </small>
                        </td>
                        <td>
                          <div className="small fw-semibold text-dark text-nowrap">{item.event_date || item.date}</div>
                          <small className="text-muted text-nowrap">{item.event_time || 'Todo el día'}</small>
                        </td>
                        <td className="small text-muted text-nowrap">
                          <MapPin size={13} className="me-1" />
                          {item.location || 'León, Nicaragua'}
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
                  {editingItem ? 'Editar Evento Cultural' : 'Agregar Evento / Tradición'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold small">Nombre del Evento / Tradición</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Icono FontAwesome</label>
                      <select
                        className="form-select"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      >
                        <option value="fa-cross">fa-cross (Religioso)</option>
                        <option value="fa-feather-alt">fa-feather-alt (Poesía / Arte)</option>
                        <option value="fa-pray">fa-pray (Tradición)</option>
                        <option value="fa-masks-theater">fa-masks-theater (Teatro / Mitos)</option>
                        <option value="fa-music">fa-music (Música)</option>
                        <option value="fa-star">fa-star (Generico)</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Fecha del Evento</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        placeholder="Ej: 7 de Diciembre"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Hora</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.event_time}
                        onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                        placeholder="Ej: 6:00 PM"
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Sede / Lugar</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Sutiaba, León"
                      />
                    </div>

                    <div className="col-12">
                      <ImageUploader
                        label="Imagen Promocional del Evento"
                        value={formData.image}
                        onChange={(img) => setFormData({ ...formData, image: img })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Descripción</label>
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
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar Evento'}
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

export default CulturaAdmin;
