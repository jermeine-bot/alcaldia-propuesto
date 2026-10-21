import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Save, Image, Video, Link as LinkIcon, Eye, EyeOff, Monitor } from 'lucide-react';
import { apiService } from '../../services/apiService';
import ImageUploader from '../components/ImageUploader';

const BG_TYPES = [
  { value: 'video', label: 'Video de Fondo', icon: Video, desc: 'Reproduce un video MP4 o WebM como fondo animado de la portada.' },
  { value: 'image', label: 'Imagen de Fondo', icon: Image, desc: 'Muestra una imagen estática de alta resolución como fondo de la portada.' },
  { value: 'none',  label: 'Sin Fondo Visual', icon: EyeOff, desc: 'La portada se muestra con un fondo oscuro sólido, sin video ni imagen.' }
];

const HeroAdmin = () => {
  const queryClient = useQueryClient();

  const { data: heroData, isLoading } = useQuery({
    queryKey: ['hero'],
    queryFn: apiService.getHero
  });

  const [formData, setFormData] = useState({
    badgeText: 'Alcaldía Municipal de León',
    title: 'BIENVENIDOS A LA CIUDAD UNIVERSITARIA Y METROPOLITANA',
    subtitle: 'Trabajando juntos por el desarrollo, la cultura y el bienestar de las familias leonesas.',
    videoUrl: '/video/leon nicaragua vista de un dron.mp4',
    fallbackImg: '/img/hero-bg.jpg',
    bgType: 'video',
    bgImageUrl: '',
    primaryBtnText: 'Conoce León',
    primaryBtnLink: '#turismo',
    secondaryBtnText: 'Servicios Rápidos',
    secondaryBtnLink: '#servicios'
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    if (heroData) {
      setFormData(prev => ({
        ...prev,
        ...heroData,
        bgType: heroData.bgType || heroData.bg_type || 'video',
        bgImageUrl: heroData.bgImageUrl || heroData.bg_image_url || ''
      }));
    }
  }, [heroData]);

  const mutation = useMutation({
    mutationFn: apiService.updateHero,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero'] });
      Swal.fire({
        icon: 'success',
        title: 'Portada Actualizada',
        text: 'La sección Hero del sitio público ha sido actualizada correctamente.',
        confirmButtonColor: '#B22222'
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: err.message || 'No se pudieron guardar los cambios.',
        confirmButtonColor: '#B22222'
      });
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;
    if (!['video/mp4', 'video/webm'].includes(file.type)) {
      Swal.fire({ icon: 'warning', title: 'Formato no permitido', text: 'Selecciona un archivo MP4 o WebM.' });
      return;
    }
    setUploadingVideo(true);
    try {
      const result = await apiService.uploadHeroVideo(file);
      setFormData(prev => ({ ...prev, videoUrl: result.url }));
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error al subir video', text: err.message });
    } finally { setUploadingVideo(false); }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
        <div className="mt-2 text-muted">Cargando configuración del Hero...</div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-xl-10">
        <div className="admin-card">
          <div className="admin-card-header">
            <h5 className="admin-card-title d-flex align-items-center gap-2">
              <Monitor size={22} className="text-danger" />
              Editar Portada Principal (Hero Banner)
            </h5>
            <a
              href="/#hero"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            >
              <Eye size={15} />
              Previsualizar en Vivo
            </a>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Etiqueta / Badge Superior */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Etiqueta de Encabezado (Badge)</label>
                <input
                  type="text"
                  name="badgeText"
                  className="form-control"
                  value={formData.badgeText || ''}
                  onChange={handleChange}
                  placeholder="Ej: Alcaldía Municipal de León"
                  required
                />
              </div>

              {/* Título Principal */}
              <div className="col-12">
                <label className="form-label fw-semibold small">Título Principal de la Portada</label>
                <textarea
                  name="title"
                  className="form-control"
                  rows={2}
                  value={formData.title || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Subtítulo / Descripción */}
              <div className="col-12">
                <label className="form-label fw-semibold small">Subtítulo Descriptivo</label>
                <textarea
                  name="subtitle"
                  className="form-control"
                  rows={3}
                  value={formData.subtitle || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* ============== SELECTOR TIPO DE FONDO ============== */}
              <div className="col-12">
                <label className="form-label fw-semibold small d-flex align-items-center gap-1">
                  <Image size={16} className="text-danger" />
                  Tipo de Fondo de la Portada
                </label>
                <div className="row g-2">
                  {BG_TYPES.map(opt => {
                    const Icon = opt.icon;
                    const isSelected = formData.bgType === opt.value;
                    return (
                      <div className="col-12 col-md-4" key={opt.value}>
                        <div
                          role="button"
                          onClick={() => setFormData(prev => ({ ...prev, bgType: opt.value }))}
                          className={`border rounded-3 p-3 text-center h-100 d-flex flex-column align-items-center justify-content-center gap-2 transition-all ${
                            isSelected
                              ? 'border-danger bg-danger-subtle shadow-sm'
                              : 'border-secondary-subtle bg-light'
                          }`}
                          style={{ cursor: 'pointer', borderWidth: isSelected ? '2px' : '1px' }}
                        >
                          <Icon size={28} className={isSelected ? 'text-danger' : 'text-muted'} />
                          <span className={`fw-semibold small ${isSelected ? 'text-danger' : 'text-dark'}`}>
                            {opt.label}
                          </span>
                          <small className="text-muted" style={{ fontSize: '0.72rem', lineHeight: 1.3 }}>
                            {opt.desc}
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Hidden input to keep value in formData */}
                <input type="hidden" name="bgType" value={formData.bgType || 'video'} />
              </div>

              {/* ============== SECCIÓN VIDEO (solo si bgType === 'video') ============== */}
              {formData.bgType === 'video' && (
                <>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small d-flex align-items-center gap-1">
                      <Video size={16} className="text-danger" />
                      Ruta / URL del Video de Fondo MP4
                    </label>
                    <input
                      type="text"
                      name="videoUrl"
                      className="form-control"
                      value={formData.videoUrl || ''}
                      onChange={handleChange}
                    />
                    <input
                      className="form-control form-control-sm mt-2"
                      type="file"
                      accept="video/mp4,video/webm"
                      disabled={uploadingVideo}
                      onChange={e => handleVideoUpload(e.target.files?.[0])}
                    />
                    <small className="text-muted">
                      Pega una URL o sube MP4/WebM (máximo 100 MB). {uploadingVideo && 'Subiendo…'}
                    </small>
                    {formData.videoUrl && (
                      <video
                        key={formData.videoUrl}
                        controls
                        muted
                        className="w-100 rounded mt-2"
                        style={{ maxHeight: 220, background: '#111' }}
                        onError={e => { e.currentTarget.poster = formData.fallbackImg || ''; }}
                      >
                        <source
                          src={formData.videoUrl}
                          type={/\.webm(?:$|\?)/i.test(formData.videoUrl) ? 'video/webm' : 'video/mp4'}
                        />
                      </video>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <ImageUploader
                      label="Imagen de Respaldo si el Video Falla (Fallback)"
                      value={formData.fallbackImg}
                      onChange={(img) => setFormData((prev) => ({ ...prev, fallbackImg: img }))}
                    />
                  </div>
                </>
              )}

              {/* ============== SECCIÓN IMAGEN (solo si bgType === 'image') ============== */}
              {formData.bgType === 'image' && (
                <div className="col-12">
                  <ImageUploader
                    label="Imagen de Fondo de la Portada (Alta Resolución Recomendada)"
                    value={formData.bgImageUrl}
                    onChange={(img) => setFormData((prev) => ({ ...prev, bgImageUrl: img }))}
                  />
                  {formData.bgImageUrl && (
                    <div className="mt-2 rounded overflow-hidden border" style={{ maxHeight: 250 }}>
                      <img
                        src={formData.bgImageUrl}
                        alt="Vista previa de fondo"
                        className="w-100"
                        style={{ objectFit: 'cover', maxHeight: 250 }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ============== AVISO SI EL FONDO ESTÁ DESACTIVADO ============== */}
              {formData.bgType === 'none' && (
                <div className="col-12">
                  <div className="alert alert-warning d-flex align-items-start gap-2 mb-0">
                    <EyeOff size={20} className="mt-1 flex-shrink-0" />
                    <div>
                      <strong>Fondo desactivado.</strong> La portada se mostrará con un fondo oscuro sólido sin video ni imagen.
                      Los textos, botones y el buscador seguirán visibles normalmente.
                    </div>
                  </div>
                </div>
              )}

              {/* Botón Principal */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small d-flex align-items-center gap-1">
                  <LinkIcon size={16} /> Texto Botón Principal
                </label>
                <input
                  type="text"
                  name="primaryBtnText"
                  className="form-control"
                  value={formData.primaryBtnText || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Enlace Botón Principal</label>
                <input
                  type="text"
                  name="primaryBtnLink"
                  className="form-control"
                  value={formData.primaryBtnLink || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Botón Secundario */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small d-flex align-items-center gap-1">
                  <LinkIcon size={16} /> Texto Botón Secundario
                </label>
                <input
                  type="text"
                  name="secondaryBtnText"
                  className="form-control"
                  value={formData.secondaryBtnText || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Enlace Botón Secundario</label>
                <input
                  type="text"
                  name="secondaryBtnLink"
                  className="form-control"
                  value={formData.secondaryBtnLink || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
              <button
                type="submit"
                className="btn btn-admin-primary px-4 d-flex align-items-center gap-2"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HeroAdmin;
