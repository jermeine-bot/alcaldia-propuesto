import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Award,
  Phone,
  Mail,
  Save,
  X,
  Quote,
  CheckCircle2,
  ListPlus
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import ImageUploader from '../components/ImageUploader';

const emptyAuthority = {
  nombre: '',
  cargo: '',
  badge: 'Autoridad',
  imagen: '/img/autoridades/alcaldesa.jpg',
  frase: '',
  biografia: '',
  responsabilidades: [
    'Dirección ejecutiva y estratégica de la gestión municipal.',
    'Supervisión de obras y proyectos de desarrollo comunitario.'
  ],
  contacto: 'despachoalcaldeleon@gmail.com',
  telefono: '23113780',
  display_order: 0,
  is_active: true
};

const AutoridadesAdmin = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newResponsibility, setNewResponsibility] = useState('');

  const [formData, setFormData] = useState({ ...emptyAuthority });

  const { data: autoridades = [], isLoading } = useQuery({
    queryKey: ['autoridades'],
    queryFn: apiService.getAutoridades
  });

  const saveMutation = useMutation({
    mutationFn: apiService.saveAutoridad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoridades'] });
      setShowModal(false);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'La autoridad municipal se guardó correctamente.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err?.message || 'No se pudo guardar la autoridad.',
        confirmButtonColor: '#B22222'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.deleteAutoridad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoridades'] });
      Swal.fire({
        icon: 'success',
        title: 'Autoridad eliminada',
        text: 'El registro se ha eliminado del sistema.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: err?.message || 'No se pudo eliminar el registro.',
        confirmButtonColor: '#B22222'
      });
    }
  });

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ ...emptyAuthority });
    setNewResponsibility('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      nombre: item.nombre || '',
      cargo: item.cargo || '',
      badge: item.badge || 'Autoridad',
      imagen: item.imagen || item.image || '/img/autoridades/alcaldesa.jpg',
      frase: item.frase || '',
      biografia: item.biografia || '',
      responsabilidades: Array.isArray(item.responsabilidades)
        ? [...item.responsabilidades]
        : [],
      contacto: item.contacto || '',
      telefono: item.telefono || '',
      display_order: item.display_order ?? 0,
      is_active: item.is_active !== undefined ? Boolean(item.is_active) : true
    });
    setNewResponsibility('');
    setShowModal(true);
  };

  const handleDelete = (id, nombre) => {
    Swal.fire({
      title: '¿Eliminar Autoridad?',
      text: `¿Estás seguro de eliminar a "${nombre}"?`,
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddResponsibility = () => {
    const trimmed = newResponsibility.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      responsabilidades: [...prev.responsabilidades, trimmed]
    }));
    setNewResponsibility('');
  };

  const handleRemoveResponsibility = (index) => {
    setFormData((prev) => ({
      ...prev,
      responsabilidades: prev.responsabilidades.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.cargo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'El nombre y el cargo de la autoridad son obligatorios.',
        confirmButtonColor: '#B22222'
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const filteredAutoridades = autoridades.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.nombre || '').toLowerCase().includes(term) ||
      (item.cargo || '').toLowerCase().includes(term) ||
      (item.badge || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="container-fluid px-0">
      {/* Encabezado */}
      <div className="admin-card mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h5 className="admin-card-title mb-1 d-flex align-items-center gap-2">
              <Users size={22} className="text-danger" />
              Nuestras Autoridades Municipales
            </h5>
            <p className="text-muted small mb-0">
              Administra alcaldes, vicealcaldes, secretarios y directores del gobierno local de León.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="btn btn-admin-primary d-flex align-items-center gap-2"
          >
            <Plus size={18} />
            Nueva Autoridad
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Estadísticas */}
      <div className="admin-card mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6 col-lg-8">
            <div className="position-relative">
              <Search
                size={18}
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              />
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Buscar autoridad por nombre, cargo o rango..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4 text-md-end text-muted small">
            Total de autoridades registradas: <strong>{autoridades.length}</strong>
          </div>
        </div>
      </div>

      {/* Lista de Tarjetas de Autoridades */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status" />
          <p className="text-muted mt-2">Cargando autoridades...</p>
        </div>
      ) : filteredAutoridades.length === 0 ? (
        <div className="admin-card text-center py-5">
          <Award size={48} className="text-muted mx-auto mb-3 opacity-50" />
          <h5 className="text-muted">No se encontraron autoridades registradas</h5>
          <p className="small text-muted mb-3">
            {searchTerm
              ? 'Prueba con otro término de búsqueda.'
              : 'Agrega una nueva autoridad para mostrarla en el portal municipal.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleOpenCreate}
              className="btn btn-admin-primary btn-sm d-inline-flex align-items-center gap-2"
            >
              <Plus size={16} /> Crear primera autoridad
            </button>
          )}
        </div>
      ) : (
        <div className="row g-3">
          {filteredAutoridades.map((item) => (
            <div key={item.id} className="col-12 col-md-6 col-xl-4">
              <div className="admin-card h-100 d-flex flex-column p-3">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <img
                    src={item.imagen || '/img/autoridades/alcaldesa.jpg'}
                    alt={item.nombre}
                    className="rounded-3 shadow-sm object-fit-cover flex-shrink-0"
                    style={{ width: 80, height: 95 }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x180?text=Autoridad';
                    }}
                  />
                  <div className="min-w-0 flex-grow-1">
                    <span className="badge bg-danger-subtle text-danger mb-1 fw-bold">
                      {item.badge || 'Autoridad'}
                    </span>
                    <h6 className="fw-bold text-dark mb-1 text-truncate" title={item.nombre}>
                      {item.nombre}
                    </h6>
                    <div className="small text-danger fw-semibold text-truncate mb-1" title={item.cargo}>
                      {item.cargo}
                    </div>
                    <span className={`badge ${item.is_active ? 'bg-success' : 'bg-secondary'} small`}>
                      {item.is_active ? 'Visible en Portal' : 'Oculto'}
                    </span>
                  </div>
                </div>

                {item.frase && (
                  <p className="fst-italic text-muted small mb-3 text-truncate-2">
                    <Quote size={12} className="me-1 text-danger opacity-50" />
                    {item.frase}
                  </p>
                )}

                <div className="small text-muted mb-3">
                  <div className="d-flex align-items-center gap-2 mb-1 text-truncate">
                    <Phone size={13} className="text-danger flex-shrink-0" />
                    <span>+505 {item.telefono || '23113780'}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-truncate">
                    <Mail size={13} className="text-danger flex-shrink-0" />
                    <span className="text-truncate">{item.contacto || 'despachoalcaldeleon@gmail.com'}</span>
                  </div>
                </div>

                <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                  <span className="text-muted small">
                    Orden: <strong>{item.display_order ?? 0}</strong>
                  </span>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleOpenEdit(item)}
                      title="Editar autoridad"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(item.id, item.nombre)}
                      title="Eliminar autoridad"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Formulario Crear / Editar */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,0.55)', zIndex: 3000 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="bg-white rounded-3 shadow-lg w-100"
            style={{ maxWidth: 780, maxHeight: '92vh', overflowY: 'auto' }}
          >
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom sticky-top bg-white">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Users size={20} className="text-danger" />
                {editingItem ? 'Editar Autoridad Municipal' : 'Nueva Autoridad Municipal'}
              </h5>
              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              <div className="row g-3">
                <div className="col-12 col-md-7">
                  <label className="form-label fw-semibold small">
                    Nombre Completo <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    placeholder="Ej. Msc. Guissela Lacayo Medrano"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-5">
                  <label className="form-label fw-semibold small">
                    Distintivo / Rango
                  </label>
                  <input
                    type="text"
                    name="badge"
                    className="form-control"
                    placeholder="Ej. Alcaldesa, Vicealcalde"
                    value={formData.badge}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small">
                    Cargo Oficial <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="cargo"
                    className="form-control"
                    placeholder="Ej. Alcaldesa Municipal de León"
                    value={formData.cargo}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Subir o ingresar URL de imagen */}
                <div className="col-12">
                  <ImageUploader
                    label="Fotografía Oficial de la Autoridad"
                    value={formData.imagen}
                    onChange={(img) => setFormData((prev) => ({ ...prev, imagen: img }))}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small">
                    Lema o Frase Institucional
                  </label>
                  <input
                    type="text"
                    name="frase"
                    className="form-control"
                    placeholder='"Construyendo juntos una ciudad próspera, limpia y llena de cultura..."'
                    value={formData.frase}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small">
                    Biografía / Perfil de Servicio
                  </label>
                  <textarea
                    name="biografia"
                    className="form-control"
                    rows={3}
                    placeholder="Trayectoria profesional y vocación comunitaria en el municipio de León..."
                    value={formData.biografia}
                    onChange={handleChange}
                  />
                </div>

                {/* Responsabilidades Dinámicas */}
                <div className="col-12">
                  <label className="form-label fw-semibold small d-flex align-items-center gap-1">
                    <CheckCircle2 size={14} className="text-danger" />
                    Responsabilidades y Funciones Principales
                  </label>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Escribe una nueva responsabilidad..."
                      value={newResponsibility}
                      onChange={(e) => setNewResponsibility(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddResponsibility();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                      onClick={handleAddResponsibility}
                    >
                      <ListPlus size={15} /> Añadir
                    </button>
                  </div>

                  {formData.responsabilidades.length > 0 ? (
                    <ul className="list-group list-group-flush border rounded-3 p-1">
                      {formData.responsabilidades.map((resp, idx) => (
                        <li
                          key={idx}
                          className="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small border-bottom"
                        >
                          <span>{resp}</span>
                          <button
                            type="button"
                            className="btn btn-link text-danger p-0 ms-2"
                            onClick={() => handleRemoveResponsibility(idx)}
                            title="Quitar responsabilidad"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <small className="text-muted fst-italic">
                      Sin responsabilidades agregadas aún.
                    </small>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small">
                    Correo Electrónico Institucional
                  </label>
                  <input
                    type="email"
                    name="contacto"
                    className="form-control"
                    placeholder="despachoalcaldeleon@gmail.com"
                    value={formData.contacto}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small">
                    Teléfono Directo
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    className="form-control"
                    placeholder="23113780"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    className="form-control"
                    value={formData.display_order}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-6 d-flex align-items-center pt-md-4">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    <label className="form-check-label small fw-semibold" htmlFor="is_active">
                      Visible públicamente en el portal
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={saveMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-admin-primary d-flex align-items-center gap-2"
                  disabled={saveMutation.isPending}
                >
                  <Save size={16} />
                  {saveMutation.isPending ? 'Guardando...' : 'Guardar Autoridad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoridadesAdmin;
