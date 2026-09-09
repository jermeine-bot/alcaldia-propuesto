import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Newspaper, Plus, Edit, Trash2, Search, CheckCircle, Clock } from 'lucide-react';
import { apiService } from '../../services/apiService';
import ImageUploader from '../components/ImageUploader';

const NoticiasAdmin = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Infraestructura',
    image: '/img/noticias/noticia1.jpg',
    summary: '',
    content: '',
    status: 'published'
  });

  const { data: noticias = [], isLoading } = useQuery({
    queryKey: ['noticias'],
    queryFn: apiService.getNoticias
  });

  const saveMutation = useMutation({
    mutationFn: apiService.saveNoticia,
    onSuccess: () => {
      queryClient.invalidateQueries(['noticias']);
      setShowModal(false);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'La noticia se ha guardado correctamente.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteNoticia,
    onSuccess: () => {
      queryClient.invalidateQueries(['noticias']);
      Swal.fire({
        icon: 'success',
        title: 'Noticia Eliminada',
        text: 'El registro se ha eliminado del sistema.',
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
      category: 'Infraestructura',
      image: '/img/noticias/noticia1.jpg',
      summary: '',
      content: '',
      status: 'published'
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
      category: item.category || 'Infraestructura',
      image: item.image || item.img || '/img/noticias/noticia1.jpg',
      summary: item.summary || item.text || '',
      content: item.content || item.summary || item.text || '',
      status: item.status || 'published',
      date: item.date
    });
    setShowModal(true);
  };

  const handleDelete = (id, title) => {
    Swal.fire({
      title: '¿Eliminar Noticia?',
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
    if (!formData.title || !formData.summary) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'El título y el resumen son obligatorios.',
        confirmButtonColor: '#B22222'
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const filteredNoticias = noticias.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Newspaper className="text-danger" size={24} />
            <h5 className="admin-card-title mb-0">Gestión de Noticias Institucionales</h5>
          </div>
          <button className="btn btn-admin-primary btn-sm d-flex align-items-center gap-2" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nueva Noticia</span>
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
                placeholder="Buscar por título o categoría..."
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
            <span className="ms-2 text-muted">Cargando noticias...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table align-middle">
              <thead>
                <tr>
                  <th style={{ minWidth: '60px' }}>Imagen</th>
                  <th style={{ minWidth: '220px' }}>Título y Fecha</th>
                  <th style={{ minWidth: '120px' }}>Categoría</th>
                  <th style={{ minWidth: '110px' }}>Estado</th>
                  <th className="text-end" style={{ minWidth: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredNoticias.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No se encontraron noticias registradas.
                    </td>
                  </tr>
                ) : (
                  filteredNoticias.map((item) => {
                    const imgSrc = item.image || item.img || '/img/noticias/noticia1.jpg';
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
                              e.target.src = '/img/noticias/noticia1.jpg';
                            }}
                          />
                        </td>
                        <td>
                          <div className="fw-semibold text-dark mb-1 text-truncate" style={{ maxWidth: 280 }} title={item.title}>
                            {item.title}
                          </div>
                          <small className="text-muted">{item.date || 'Reciente'}</small>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border text-nowrap">{item.category}</span>
                        </td>
                        <td>
                          <span className={`badge-status text-nowrap ${item.status === 'published' ? 'badge-status-published' : 'badge-status-draft'}`}>
                            {item.status === 'published' ? <CheckCircle size={12} /> : <Clock size={12} />}
                            {item.status === 'published' ? 'Publicado' : 'Borrador'}
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
                  {editingItem ? 'Editar Noticia' : 'Crear Nueva Noticia'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold small">Título de la Noticia</label>
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
                        <option value="Cultura">Cultura y Tradición</option>
                        <option value="Comunidad">Comunidad</option>
                        <option value="Deportes">Deportes</option>
                        <option value="Turismo">Turismo</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-8">
                      <ImageUploader
                        label="Imagen Destacada de la Noticia"
                        value={formData.image}
                        onChange={(img) => setFormData({ ...formData, image: img })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Estado</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="published">Publicado</option>
                        <option value="draft">Borrador</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Resumen Corto (Tarjeta)</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Contenido Completo de la Noticia</label>
                      <textarea
                        className="form-control"
                        rows={4}
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
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar Noticia'}
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

export default NoticiasAdmin;
