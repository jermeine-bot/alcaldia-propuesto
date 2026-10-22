import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Images, Plus, Pencil, Trash2, Power, Save, X, Search, UploadCloud } from 'lucide-react';
import { apiService } from '../../services/apiService';

const blank = {
  title: '',
  description: '',
  category: 'General',
  image: '',
  display_order: 0,
  is_active: true
};

const GaleriaAdmin = () => {
  const client = useQueryClient();
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [search, setSearch] = useState('');
  const bulkInputRef = useRef(null);

  const { data: imagenes = [], isLoading, error } = useQuery({
    queryKey: ['galeria'],
    queryFn: apiService.getGaleria
  });

  const refresh = () => client.invalidateQueries({ queryKey: ['galeria'] });

  const reportError = (err) => Swal.fire('No se pudo completar la acción', err.message, 'error');

  const save = useMutation({
    mutationFn: apiService.saveGaleriaItem,
    onSuccess: () => {
      setForm(null);
      refresh();
      Swal.fire({
        icon: 'success',
        title: 'Imagen guardada',
        text: 'La galería se actualizó correctamente.',
        confirmButtonColor: '#B22222',
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: reportError
  });

  const remove = useMutation({
    mutationFn: apiService.deleteGaleriaItem,
    onSuccess: refresh,
    onError: reportError
  });

  const toggle = useMutation({
    mutationFn: apiService.toggleGaleriaStatus,
    onSuccess: refresh,
    onError: reportError
  });

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire('Formato inválido', 'Selecciona un archivo de imagen.', 'warning');
      return;
    }
    setUploading(true);
    try {
      const result = await apiService.uploadGaleriaImage(file);
      change('image', result.url);
    } catch (err) {
      Swal.fire('Error al subir', err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const uploadBulk = async (fileList) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'));
    if (!files.length) return;

    setBulkUploading(true);
    let created = 0;
    let nextOrder = imagenes.reduce((max, item) => Math.max(max, Number(item.display_order) || 0), 0) + 1;

    try {
      for (const file of files) {
        const uploaded = await apiService.uploadGaleriaImage(file);
        const cleanTitle = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
        await apiService.saveGaleriaItem({
          title: cleanTitle || 'Galería',
          description: '',
          category: 'General',
          image: uploaded.url,
          display_order: nextOrder++,
          is_active: 1
        });
        created += 1;
      }

      await refresh();
      Swal.fire({
        icon: 'success',
        title: `${created} imagen${created === 1 ? '' : 'es'} agregada${created === 1 ? '' : 's'}`,
        text: 'Las imágenes ya forman parte de la galería.',
        confirmButtonColor: '#B22222'
      });
    } catch (err) {
      await refresh();
      Swal.fire(
        'Carga incompleta',
        `${created} imagen(es) se guardaron. ${err.message}`,
        'warning'
      );
    } finally {
      setBulkUploading(false);
      if (bulkInputRef.current) bulkInputRef.current.value = '';
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.image) {
      Swal.fire('Imagen requerida', 'Sube una imagen o indica una URL antes de guardar.', 'warning');
      return;
    }
    save.mutate({
      ...form,
      is_active: form.is_active ? 1 : 0,
      display_order: Number(form.display_order || 0)
    });
  };

  const confirmDelete = async (item) => {
    const result = await Swal.fire({
      title: '¿Eliminar esta imagen?',
      text: item.title || 'Imagen de la galería',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#B22222'
    });
    if (result.isConfirmed) remove.mutate(item.id);
  };

  const term = search.trim().toLowerCase();
  const filtered = imagenes.filter((item) =>
    !term ||
    (item.title || '').toLowerCase().includes(term) ||
    (item.category || '').toLowerCase().includes(term)
  );

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Images className="text-danger" size={24} />
            <div>
              <h5 className="admin-card-title mb-0">Galería de imágenes</h5>
              <small className="text-muted">Sube, ordena y publica las fotografías del portal.</small>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <input
              ref={bulkInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="d-none"
              onChange={(event) => uploadBulk(event.target.files)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
              disabled={bulkUploading}
              onClick={() => bulkInputRef.current?.click()}
            >
              <UploadCloud size={16} />
              {bulkUploading ? 'Subiendo…' : 'Subir varias'}
            </button>
            <button
              type="button"
              className="btn btn-admin-primary btn-sm d-flex align-items-center gap-2"
              onClick={() => setForm({ ...blank })}
            >
              <Plus size={16} />
              Nueva imagen
            </button>
          </div>
        </div>

        <div className="row mb-3 g-2">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Buscar por título o categoría…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger m-3">{error.message}</div>}

        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border text-danger spinner-border-sm me-2" role="status"></div>
            Cargando galería…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            {imagenes.length === 0
              ? 'Todavía no hay imágenes. Usa "Subir varias" o "Nueva imagen" para comenzar.'
              : 'No se encontraron imágenes con ese criterio.'}
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map((item) => (
              <div key={item.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                <div className="card h-100 border-0 shadow-sm overflow-hidden">
                  <div className="position-relative">
                    <img
                      src={item.image}
                      alt={item.title || 'Imagen de galería'}
                      style={{ height: 170, width: '100%', objectFit: 'cover' }}
                    />
                    <span className="position-absolute top-0 start-0 m-2 badge bg-dark bg-opacity-75">
                      Orden {item.display_order}
                    </span>
                    <span className={`position-absolute top-0 end-0 m-2 badge ${item.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {item.is_active ? 'Visible' : 'Oculta'}
                    </span>
                  </div>
                  <div className="card-body p-3 d-flex flex-column">
                    <span className="badge bg-danger-subtle text-danger align-self-start mb-1">{item.category}</span>
                    <h6 className="fw-bold text-dark mb-1 text-truncate" title={item.title || 'Sin título'}>
                      {item.title || 'Sin título'}
                    </h6>
                    <p className="small text-secondary flex-grow-1 mb-2" style={{ fontSize: '0.82rem' }}>
                      {item.description || 'Sin descripción.'}
                    </p>
                    <div className="d-flex justify-content-end gap-1 pt-2 border-top">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary py-1"
                        title="Editar"
                        onClick={() => setForm({ ...blank, ...item, is_active: Boolean(item.is_active) })}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary py-1"
                        title={item.is_active ? 'Ocultar imagen' : 'Publicar imagen'}
                        aria-label={item.is_active ? 'Ocultar imagen' : 'Publicar imagen'}
                        disabled={toggle.isPending}
                        onClick={() => toggle.mutate(item.id)}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-1"
                        title="Eliminar"
                        onClick={() => confirmDelete(item)}
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
      </div>

      {form && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,.55)', zIndex: 3000 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setForm(null);
          }}
        >
          <div className="bg-white rounded-3 shadow-lg w-100" style={{ maxWidth: 720, maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0">{form.id ? 'Editar imagen' : 'Nueva imagen'}</h5>
              <button type="button" className="btn btn-light btn-sm" onClick={() => setForm(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="p-3">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label">Título</label>
                  <input
                    className="form-control"
                    value={form.title || ''}
                    onChange={(event) => change('title', event.target.value)}
                    placeholder="Ej. Parque Central de León"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Categoría</label>
                  <input
                    className="form-control"
                    value={form.category || ''}
                    onChange={(event) => change('category', event.target.value)}
                    placeholder="General"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={form.description || ''}
                    onChange={(event) => change('description', event.target.value)}
                    placeholder="Texto que acompaña la imagen en el visor."
                  />
                </div>

                <div className="col-md-7">
                  <label className="form-label">Imagen</label>
                  <input
                    className="form-control"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={uploading}
                    onChange={(event) => upload(event.target.files?.[0])}
                  />
                  <input
                    className="form-control mt-2"
                    placeholder="o pega una URL/ruta de imagen"
                    value={form.image || ''}
                    onChange={(event) => change('image', event.target.value)}
                  />
                  {uploading && <small className="text-muted">Subiendo imagen…</small>}
                </div>

                <div className="col-md-5">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Vista previa"
                      className="img-fluid rounded"
                      style={{ maxHeight: 150, width: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="border rounded d-flex align-items-center justify-content-center text-muted" style={{ height: 150 }}>
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Orden</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.display_order ?? 0}
                    onChange={(event) => change('display_order', event.target.value)}
                  />
                </div>

                <div className="col-md-8 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="galeria-publicada"
                      checked={Boolean(form.is_active)}
                      onChange={(event) => change('is_active', event.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="galeria-publicada">Visible en el portal</label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(null)}>
                  Cancelar
                </button>
                <button className="btn btn-admin-primary" disabled={save.isPending || uploading}>
                  <Save size={16} className="me-1" />
                  {save.isPending ? 'Guardando…' : 'Guardar imagen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaAdmin;
