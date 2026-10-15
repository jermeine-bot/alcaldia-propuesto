import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Megaphone, Save, Eye, Link as LinkIcon, Power, CheckCircle2, XCircle, Trash2, RotateCcw } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5505/api';

const getAuthToken = () => {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('jwt') ||
    sessionStorage.getItem('token') ||
    ''
  );
};

const defaultAnuncio = {
  isActive: true,
  badge: 'Aviso Importante',
  title: 'Comunicado Oficial — Alcaldía Municipal de León',
  description: 'Conoce las nuevas jornadas, trámites en línea y actividades municipales.',
  image: '/img/turismo/catedral.jpg',
  linkUrl: '',
  buttonText: 'Ver más información',
  showOncePerSession: false
};

const emptyAnuncio = {
  isActive: false,
  badge: '',
  title: '',
  description: '',
  image: '',
  linkUrl: '',
  buttonText: 'Ver más información',
  showOncePerSession: false
};

const AnuncioAdmin = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(defaultAnuncio);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: savedData, isLoading } = useQuery({
    queryKey: ['cms', 'anuncio-portal'],
    queryFn: async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE}/cms/anuncio-portal`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const json = await res.json();
          const parsed = json?.content
            ? typeof json.content === 'string'
              ? JSON.parse(json.content)
              : json.content
            : json;
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
      const local = localStorage.getItem('cms_anuncio_portal');
      return local ? JSON.parse(local) : defaultAnuncio;
    }
  });

  useEffect(() => {
    if (savedData) {
      setFormData({
        ...defaultAnuncio,
        ...savedData
      });
    }
  }, [savedData]);

  const formatUrl = (url) => {
    if (!url || !url.trim()) return '';
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const persistAnuncio = async (dataToSave) => {
    localStorage.setItem('cms_anuncio_portal', JSON.stringify(dataToSave));
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith('anuncio_visto_')) sessionStorage.removeItem(k);
    });

    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/cms/anuncio-portal`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(dataToSave)
      });

      if (!res.ok) {
        const resPost = await fetch(`${API_BASE}/cms/anuncio-portal`, {
          method: 'POST',
          headers,
          body: JSON.stringify(dataToSave)
        });
        if (resPost.ok) return await resPost.json();
      } else {
        return await res.json();
      }
    } catch (e) {}
    return dataToSave;
  };

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const dataToSave = {
        ...payload,
        linkUrl: formatUrl(payload.linkUrl),
        updatedAt: Date.now()
      };
      return await persistAnuncio(dataToSave);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'anuncio-portal'] });
      Swal.fire({
        icon: 'success',
        title: variables.isActive ? '¡Anuncio Guardado y Activo!' : 'Anuncio Desactivado / Eliminado',
        text: variables.isActive
          ? 'El flyer aparecerá al cargar el portal principal.'
          : 'El flyer ya no se mostrará en la página principal.',
        confirmButtonColor: '#B22222',
        timer: 1800,
        showConfirmButton: false
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err?.message || 'No se pudo guardar la configuración del anuncio.',
        confirmButtonColor: '#B22222'
      });
    }
  });

  const handleDeleteFlyer = () => {
    Swal.fire({
      title: '¿Eliminar y quitar el Anuncio?',
      text: 'Se borrará el flyer actual y dejará de aparecer en la página principal hasta que subas otro.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#B22222',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar anuncio',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(emptyAnuncio);
        saveMutation.mutate(emptyAnuncio);
      }
    });
  };

  const handleRestoreDefault = () => {
    setFormData(defaultAnuncio);
    saveMutation.mutate(defaultAnuncio);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.isActive && !formData.image) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta la imagen del Flyer',
        text: 'Sube una imagen para el flyer o desactiva el anuncio.',
        confirmButtonColor: '#B22222'
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Megaphone className="text-danger" size={24} />
            <div>
              <h5 className="admin-card-title mb-0">Gestión de Anuncio / Flyer de Entrada</h5>
              <small className="text-muted">
                Edita, activa o elimina el flyer emergente que aparece después de la intro en el portal ciudadano.
              </small>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {formData.image && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye size={16} /> Previsualizar
              </button>
            )}

            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1 ${
                formData.isActive ? 'btn-success' : 'btn-secondary'
              }`}
              onClick={() => {
                const updated = { ...formData, isActive: !formData.isActive };
                setFormData(updated);
                saveMutation.mutate(updated);
              }}
            >
              <Power size={15} />
              {formData.isActive ? 'Activo en Portal' : 'Oculto / Inactivo'}
            </button>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
              onClick={handleDeleteFlyer}
              title="Eliminar el anuncio actual"
            >
              <Trash2 size={15} /> Eliminar Anuncio
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-danger spinner-border-sm" role="status"></div>
            <span className="ms-2 text-muted">Cargando configuración del anuncio...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-12 col-lg-7">
                <div className="p-3 rounded border bg-light bg-opacity-50 mb-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    {formData.isActive ? (
                      <CheckCircle2 className="text-success" size={22} />
                    ) : (
                      <XCircle className="text-secondary" size={22} />
                    )}
                    <div>
                      <div className="fw-bold small">
                        Estado actual: {formData.isActive ? 'MOSTRANDO FLYER EN LA PÁGINA' : 'NO SE MUESTRA EN LA PÁGINA'}
                      </div>
                      <small className="text-muted">
                        Puedes apagarlo temporalmente con el interruptor o eliminarlo con el botón rojo.
                      </small>
                    </div>
                  </div>
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      style={{ width: '2.8em', height: '1.4em', cursor: 'pointer' }}
                      checked={Boolean(formData.isActive)}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label fw-semibold small">Etiqueta (Badge)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej. Aviso Importante"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    />
                  </div>

                  <div className="col-12 col-md-8">
                    <label className="form-label fw-semibold small">Título del Anuncio</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej. Comunicado Oficial o Evento Municipal"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold small">Descripción Corta</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Descripción breve que acompaña al flyer..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="col-12 col-md-7">
                    <label className="form-label fw-semibold small d-flex align-items-center gap-1">
                      <LinkIcon size={14} className="text-danger" /> Link al tocar el Flyer (URL destino)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://ejemplo.com/info"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    />
                  </div>

                  <div className="col-12 col-md-5">
                    <label className="form-label fw-semibold small">Texto del Botón</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ver más información"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="oncePerSessionCheck"
                        checked={Boolean(formData.showOncePerSession)}
                        onChange={(e) => setFormData({ ...formData, showOncePerSession: e.target.checked })}
                      />
                      <label className="form-check-label small text-secondary" htmlFor="oncePerSessionCheck">
                        Mostrar solo una vez por sesión del navegador
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-5">
                <ImageUploader
                  label="Imagen del Flyer (Arrastra o selecciona)"
                  value={formData.image}
                  onChange={(img) => setFormData({ ...formData, image: img, isActive: true })}
                />

                <div className="mt-3 p-3 border rounded bg-light text-center">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-semibold text-muted">Flyer actual</span>
                    {formData.image && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-danger p-0 text-decoration-none"
                        onClick={() => setFormData({ ...formData, image: '' })}
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview Flyer"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: '220px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="py-4 text-muted small">
                      Sin imagen de flyer configurada.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                onClick={handleRestoreDefault}
              >
                <RotateCcw size={15} /> Restaurar Anuncio de Ejemplo
              </button>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-danger d-flex align-items-center gap-1"
                  onClick={handleDeleteFlyer}
                >
                  <Trash2 size={16} /> Eliminar
                </button>
                <button
                  type="submit"
                  className="btn btn-admin-primary d-flex align-items-center gap-2 px-4"
                  disabled={saveMutation.isPending}
                >
                  <Save size={16} />
                  <span>{saveMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {previewOpen && (
        <div
          className="modal d-block"
          tabIndex="-1"
          onClick={() => setPreviewOpen(false)}
          style={{
            backgroundColor: 'rgba(10, 12, 16, 0.78)',
            backdropFilter: 'blur(6px)',
            zIndex: 1060
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: '18px' }}>
              <img
                src={formData.image || '/img/turismo/catedral.jpg'}
                alt="Vista previa"
                className="img-fluid w-100"
                style={{ maxHeight: '68vh', objectFit: 'contain', backgroundColor: '#111' }}
              />
              <div className="p-3 bg-white text-center">
                {formData.badge && (
                  <span className="badge bg-danger-subtle text-danger mb-1">{formData.badge}</span>
                )}
                {formData.title && <h5 className="fw-bold mb-1">{formData.title}</h5>}
                {formData.description && <p className="small text-secondary mb-2">{formData.description}</p>}
                <button className="btn btn-secondary btn-sm rounded-pill px-4" onClick={() => setPreviewOpen(false)}>
                  Cerrar Vista Previa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnuncioAdmin;