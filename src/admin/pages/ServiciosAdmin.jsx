import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Briefcase, Plus, Edit, Trash2, Search, Link as LinkIcon, Layers, FileText, Save } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { initialServiciosSettings } from '../../services/initialData';

const ServiciosAdmin = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [sectionFormData, setSectionFormData] = useState(initialServiciosSettings);

  const showMutationError = (error) => {
    Swal.fire({
      icon: 'error',
      title: 'No se pudo guardar',
      text: error.message || 'Verifica la conexión y los permisos de tu cuenta.',
      confirmButtonColor: '#B22222'
    });
  };

  // Form State para Categoría
  const [categoryFormData, setCategoryFormData] = useState({
    title: '',
    subtitle: '',
    badgeIcon: '📋',
    icon: 'fa-landmark',
    desc: ''
  });

  // Form State para Sub-servicio / Trámite
  const [subFormData, setSubFormData] = useState({
    title: '',
    desc: '',
    icon: 'fa-file-signature',
    linkText: 'Solicitar Permiso',
    linkUrl: '#contacto'
  });

  // Fetch de Servicios desde la API del backend
  const { data: servicios = [], isLoading } = useQuery({
    queryKey: ['servicios'],
    queryFn: apiService.getServicios
  });

  const { data: sectionSettings = initialServiciosSettings } = useQuery({
    queryKey: ['servicios-settings'],
    queryFn: apiService.getServiciosSettings,
    initialData: initialServiciosSettings
  });

  useEffect(() => {
    setSectionFormData(sectionSettings);
  }, [sectionSettings]);

  const saveSectionMutation = useMutation({
    mutationFn: apiService.saveServiciosSettings,
    onSuccess: (savedSettings) => {
      queryClient.setQueryData(['servicios-settings'], savedSettings);
      Swal.fire({
        icon: 'success',
        title: 'Sección actualizada',
        text: 'Los textos de Servicios se guardaron correctamente.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: showMutationError
  });

  // Mutations Categoría
  const saveCategoryMutation = useMutation({
    mutationFn: apiService.saveServicio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      setShowCategoryModal(false);
      resetCategoryForm();
      Swal.fire({
        icon: 'success',
        title: 'Categoría Guardada',
        text: 'La categoría de servicios ha sido guardada correctamente.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: showMutationError
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: apiService.deleteServicio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      Swal.fire({
        icon: 'success',
        title: 'Categoría Eliminada',
        text: 'La categoría de servicios ha sido eliminada.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: showMutationError
  });

  // Mutations Sub-servicio
  const saveSubMutation = useMutation({
    mutationFn: ({ catId, subData }) => apiService.saveSubservicio(catId, subData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      setShowSubModal(false);
      resetSubForm();
      Swal.fire({
        icon: 'success',
        title: 'Trámite Guardado',
        text: 'El trámite o servicio ha sido guardado exitosamente.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: showMutationError
  });

  const deleteSubMutation = useMutation({
    mutationFn: ({ catId, subId }) => apiService.deleteSubservicio(catId, subId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      Swal.fire({
        icon: 'success',
        title: 'Trámite Eliminado',
        text: 'El trámite ha sido eliminado de la categoría.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: showMutationError
  });

  // Helpers de Reset Form
  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryFormData({
      title: '',
      subtitle: '',
      badgeIcon: '📋',
      icon: 'fa-landmark',
      desc: ''
    });
  };

  const resetSubForm = () => {
    setEditingSub(null);
    setSelectedCatId(null);
    setSubFormData({
      title: '',
      desc: '',
      icon: 'fa-file-signature',
      linkText: 'Solicitar Permiso',
      linkUrl: '#contacto'
    });
  };

  // Handlers Categorías
  const handleOpenCreateCategory = () => {
    resetCategoryForm();
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({
      id: cat.id,
      title: cat.title || '',
      subtitle: cat.subtitle || '',
      badgeIcon: cat.badgeIcon || '📋',
      icon: cat.icon || 'fa-landmark',
      desc: cat.desc || '',
      opciones: cat.opciones || []
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (cat) => {
    Swal.fire({
      title: '¿Eliminar Categoría?',
      text: `¿Estás seguro de eliminar "${cat.title}" y todos sus trámites asociados?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B22222',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCategoryMutation.mutate(cat.id);
      }
    });
  };

  const handleSubmitCategory = (e) => {
    e.preventDefault();
    if (!categoryFormData.title || !categoryFormData.subtitle) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Ingresa al menos el título y el subtítulo de la categoría.',
        confirmButtonColor: '#B22222'
      });
      return;
    }
    saveCategoryMutation.mutate(categoryFormData);
  };

  // Handlers Sub-servicios / Trámites
  const handleOpenCreateSub = (catId) => {
    resetSubForm();
    setSelectedCatId(catId);
    setShowSubModal(true);
  };

  const handleOpenEditSub = (catId, sub) => {
    setSelectedCatId(catId);
    setEditingSub(sub);
    setSubFormData({
      id: sub.id,
      title: sub.title || '',
      desc: sub.desc || '',
      icon: sub.icon || 'fa-file-signature',
      linkText: sub.linkText || 'Solicitar Permiso',
      linkUrl: sub.linkUrl || '#contacto'
    });
    setShowSubModal(true);
  };

  const handleDeleteSub = (catId, sub) => {
    Swal.fire({
      title: '¿Eliminar Trámite?',
      text: `¿Estás seguro de eliminar "${sub.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B22222',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSubMutation.mutate({ catId, subId: sub.id });
      }
    });
  };

  const handleSubmitSub = (e) => {
    e.preventDefault();
    if (!subFormData.title || !subFormData.desc) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Ingresa el nombre del trámite y su descripción.',
        confirmButtonColor: '#B22222'
      });
      return;
    }
    saveSubMutation.mutate({ catId: selectedCatId, subData: subFormData });
  };

  // Filtro
  const filteredServicios = servicios.filter(
    (cat) =>
      cat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.opciones?.some((s) => s.title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="admin-card mb-4">
        <div className="admin-card-header">
          <h5 className="admin-card-title mb-0">Textos de la sección pública</h5>
        </div>
        <form onSubmit={(event) => {
          event.preventDefault();
          saveSectionMutation.mutate(sectionFormData);
        }}>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold small">Etiqueta superior</label>
              <input
                className="form-control"
                value={sectionFormData.eyebrow}
                onChange={(event) => setSectionFormData({ ...sectionFormData, eyebrow: event.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-8">
              <label className="form-label fw-semibold small">Título principal</label>
              <input
                className="form-control"
                value={sectionFormData.title}
                onChange={(event) => setSectionFormData({ ...sectionFormData, title: event.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-8">
              <label className="form-label fw-semibold small">Descripción</label>
              <textarea
                className="form-control"
                rows={2}
                value={sectionFormData.description}
                onChange={(event) => setSectionFormData({ ...sectionFormData, description: event.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold small">Teléfono de orientación</label>
              <input
                className="form-control"
                value={sectionFormData.phone}
                onChange={(event) => setSectionFormData({ ...sectionFormData, phone: event.target.value })}
                required
              />
            </div>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <button type="submit" className="btn btn-admin-primary btn-sm d-flex align-items-center gap-2" disabled={saveSectionMutation.isPending}>
              <Save size={15} />
              <span>{saveSectionMutation.isPending ? 'Guardando...' : 'Guardar textos'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card mb-4">
        <div className="admin-card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Briefcase className="text-danger" size={24} />
            <h5 className="admin-card-title mb-0">Gestión CMS: Trámites y Servicios</h5>
          </div>
          <button className="btn btn-admin-primary btn-sm d-flex align-items-center gap-2" onClick={handleOpenCreateCategory}>
            <Plus size={16} />
            <span>Nueva Categoría</span>
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
                placeholder="Buscar por categoría o nombre de trámite..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Carga o Lista de Categorías */}
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-danger spinner-border-sm" role="status"></div>
            <span className="ms-2 text-muted">Cargando trámites y servicios...</span>
          </div>
        ) : (
          <div className="row g-4">
            {filteredServicios.length === 0 ? (
              <div className="col-12 text-center text-muted py-4">
                No hay categorías de servicios registradas.
              </div>
            ) : (
              filteredServicios.map((cat) => (
                <div key={cat.id} className="col-12 col-lg-6">
                  <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="card-header bg-light border-bottom p-3 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-5">{cat.badgeIcon || '📁'}</span>
                        <div>
                          <h6 className="fw-bold mb-0 text-dark">{cat.title}</h6>
                          <small className="text-muted">{cat.subtitle}</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <button
                          className="btn btn-outline-secondary btn-sm p-1 px-2"
                          onClick={() => handleOpenEditCategory(cat)}
                          title="Editar categoría"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm p-1 px-2"
                          onClick={() => handleDeleteCategory(cat)}
                          title="Eliminar categoría"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="card-body p-3">
                      <p className="small text-secondary mb-3">{cat.desc}</p>

                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-bold text-dark small d-flex align-items-center gap-1">
                          <Layers size={14} className="text-danger" /> Trámites ({cat.opciones?.length || 0})
                        </span>
                        <button
                          className="btn btn-outline-danger btn-sm py-0 px-2 small d-flex align-items-center gap-1"
                          onClick={() => handleOpenCreateSub(cat.id)}
                        >
                          <Plus size={13} /> Agregar Trámite
                        </button>
                      </div>

                      {/* Lista de Subservicios */}
                      <div className="d-flex flex-column gap-2 mt-2">
                        {(!cat.opciones || cat.opciones.length === 0) ? (
                          <div className="text-muted small italic py-2 border rounded p-2 text-center">
                            Sin trámites registrados en esta categoría.
                          </div>
                        ) : (
                          cat.opciones.map((sub) => (
                            <div key={sub.id} className="p-2 border rounded-3 bg-white d-flex align-items-center justify-content-between gap-2">
                              <div className="d-flex align-items-center gap-2 overflow-hidden">
                                <div className="bg-danger-subtle text-danger p-2 rounded-2 flex-shrink-0">
                                  <i className={`fas ${sub.icon || 'fa-file-alt'}`}></i>
                                </div>
                                <div className="text-truncate">
                                  <h6 className="mb-0 fw-semibold text-dark small text-truncate" title={sub.title}>
                                    {sub.title}
                                  </h6>
                                  <small className="text-muted text-truncate d-block" style={{ fontSize: '0.75rem' }}>
                                    Enlace: <span className="text-danger fw-mono">{sub.linkUrl || '#contacto'}</span> ({sub.linkText})
                                  </small>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                <button
                                  className="btn btn-sm btn-light text-secondary border p-1"
                                  onClick={() => handleOpenEditSub(cat.id, sub)}
                                  title="Editar trámite / enlace"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  className="btn btn-sm btn-light text-danger border p-1"
                                  onClick={() => handleDeleteSub(cat.id, sub)}
                                  title="Eliminar trámite"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODAL CATEGORÍA */}
      {showCategoryModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría de Servicios'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
              </div>

              <form onSubmit={handleSubmitCategory}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold small">Título de Categoría</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Impuestos y Pagos"
                        value={categoryFormData.title}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Badge Emoji</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. 💰"
                        value={categoryFormData.badgeIcon}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, badgeIcon: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Subtítulo Resumen</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Consulta y paga tus obligaciones"
                        value={categoryFormData.subtitle}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, subtitle: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Ícono FontAwesome</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. fa-hand-holding-usd"
                        value={categoryFormData.icon}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Descripción Detallada</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Describe el objetivo de esta categoría..."
                        value={categoryFormData.desc}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, desc: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCategoryModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-admin-primary btn-sm" disabled={saveCategoryMutation.isPending}>
                    {saveCategoryMutation.isPending ? 'Guardando...' : 'Guardar Categoría'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUBSERVICIO / TRÁMITE */}
      {showSubModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold">
                  {editingSub ? 'Editar Trámite / Enlace' : 'Agregar Trámite a la Categoría'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowSubModal(false)}></button>
              </div>

              <form onSubmit={handleSubmitSub}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold small">Nombre del Trámite / Servicio</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Pago de Impuesto Bienes Inmuebles (IBI)"
                        value={subFormData.title}
                        onChange={(e) => setSubFormData({ ...subFormData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold small">Ícono FontAwesome</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. fa-home"
                        value={subFormData.icon}
                        onChange={(e) => setSubFormData({ ...subFormData, icon: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Descripción Breve</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Instrucciones breves del trámite..."
                        value={subFormData.desc}
                        onChange={(e) => setSubFormData({ ...subFormData, desc: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Texto del Botón / Enlace</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Pagar IBI / Iniciar Trámite"
                        value={subFormData.linkText}
                        onChange={(e) => setSubFormData({ ...subFormData, linkText: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small d-flex align-items-center gap-1">
                        <LinkIcon size={14} className="text-danger" /> URL o Enlace Destino
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. #contacto o https://tramites.gob.ni"
                        value={subFormData.linkUrl}
                        onChange={(e) => setSubFormData({ ...subFormData, linkUrl: e.target.value })}
                      />
                      <div className="form-text text-muted small">
                        Usa `#contacto` para ir al formulario interno o un link externo HTTP.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSubModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-admin-primary btn-sm" disabled={saveSubMutation.isPending}>
                    {saveSubMutation.isPending ? 'Guardando...' : 'Guardar Trámite'}
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

export default ServiciosAdmin;
