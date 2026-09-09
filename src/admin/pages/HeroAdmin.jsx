import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Save, Image, Video, Link as LinkIcon, Eye } from 'lucide-react';
import { apiService } from '../../services/apiService';
import ImageUploader from '../components/ImageUploader';

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
    primaryBtnText: 'Conoce León',
    primaryBtnLink: '#turismo',
    secondaryBtnText: 'Servicios Rápidos',
    secondaryBtnLink: '#servicios'
  });

  useEffect(() => {
    if (heroData) {
      setFormData(heroData);
    }
  }, [heroData]);

  const mutation = useMutation({
    mutationFn: apiService.updateHero,
    onSuccess: () => {
      queryClient.invalidateQueries(['hero']);
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
              <Image size={22} className="text-danger" />
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

              {/* URL de Video */}
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
                  required
                />
                <small className="text-muted">Ej: /video/leon nicaragua vista de un dron.mp4</small>
              </div>

              {/* Imagen Fallback / Banner */}
              <div className="col-12 col-md-6">
                <ImageUploader
                  label="Imagen de Fondo de Portada (Fallback)"
                  value={formData.fallbackImg}
                  onChange={(img) => setFormData((prev) => ({ ...prev, fallbackImg: img }))}
                />
              </div>

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
