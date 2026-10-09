import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Link as LinkIcon, Plus, Save, Share2, Trash2 } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { initialRedesSocialesData } from '../../services/initialData';

const RedesSocialesAdmin = () => {
  const queryClient = useQueryClient();
  const { data: socialData = initialRedesSocialesData, isLoading } = useQuery({
    queryKey: ['redes-sociales'],
    queryFn: apiService.getRedesSociales,
    staleTime: 0
  });

  const saveMutation = useMutation({
    mutationFn: apiService.saveRedesSociales,
    onSuccess: (saved) => {
      queryClient.setQueryData(['redes-sociales'], saved);
      Swal.fire({ icon: 'success', title: 'Redes actualizadas', timer: 1300, showConfirmButton: false });
    },
    onError: (error) => Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.message })
  });

  const updateSocial = (id, field, value) => {
    queryClient.setQueryData(['redes-sociales'], (current = initialRedesSocialesData) => ({
      ...current,
      platforms: current.platforms.map((platform) => platform.id === id ? { ...platform, [field]: value } : platform)
    }));
  };

  const updateGallery = (platform, index, value) => {
    const images = [...platform.images];
    images[index] = value;
    updateSocial(platform.id, 'images', images);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!socialData.title.trim() || !socialData.description.trim() || socialData.platforms.some((platform) => !platform.name.trim() || !platform.url.trim())) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Completa el título, la descripción y los enlaces de todas las redes.' });
      return;
    }
    saveMutation.mutate(socialData);
  };

  if (isLoading) return <div className="text-center py-5"><div className="spinner-border text-danger" /></div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-card mb-4">
        <div className="admin-card-header flex-wrap gap-2">
          <h5 className="admin-card-title mb-0 d-flex align-items-center gap-2"><Share2 size={21} className="text-danger" /> Gestión de Redes Sociales</h5>
          <button type="submit" className="btn btn-admin-primary btn-sm d-flex align-items-center gap-2" disabled={saveMutation.isPending}>
            <Save size={15} /> {saveMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold">Etiqueta de sección</label>
            <input className="form-control" value={socialData.eyebrow} onChange={(event) => queryClient.setQueryData(['redes-sociales'], { ...socialData, eyebrow: event.target.value })} required />
          </div>
          <div className="col-12 col-md-8">
            <label className="form-label small fw-semibold">Título</label>
            <input className="form-control" value={socialData.title} onChange={(event) => queryClient.setQueryData(['redes-sociales'], { ...socialData, title: event.target.value })} required />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold">Descripción pública</label>
            <textarea className="form-control" rows={2} value={socialData.description} onChange={(event) => queryClient.setQueryData(['redes-sociales'], { ...socialData, description: event.target.value })} required />
          </div>
        </div>
      </div>

      {socialData.platforms.map((platform) => (
        <section className="admin-card mb-3" key={platform.id}>
          <div className="admin-card-header">
            <h6 className="admin-card-title mb-0 d-flex align-items-center gap-2"><i className={`fab ${platform.icon}`} /> {platform.name}</h6>
            <a className="btn btn-sm btn-outline-secondary" href={platform.url} target="_blank" rel="noreferrer" title="Abrir perfil"><LinkIcon size={14} /></a>
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Nombre visible</label>
              <input className="form-control" value={platform.name} onChange={(event) => updateSocial(platform.id, 'name', event.target.value)} required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Usuario / perfil</label>
              <input className="form-control" value={platform.handle} onChange={(event) => updateSocial(platform.id, 'handle', event.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">URL oficial</label>
              <input className="form-control" type="url" value={platform.url} onChange={(event) => updateSocial(platform.id, 'url', event.target.value)} required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Seguidores / suscriptores</label>
              <input className="form-control" type="number" min="0" value={platform.statTarget ?? ''} onChange={(event) => updateSocial(platform.id, 'statTarget', event.target.value === '' ? null : Number(event.target.value))} placeholder="Dejar vacío para ocultar" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Texto del contador</label>
              <input className="form-control" value={platform.statLabel} onChange={(event) => updateSocial(platform.id, 'statLabel', event.target.value)} placeholder="Seguidores Instagram" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Color de marca</label>
              <input className="form-control form-control-color w-100" type="color" value={platform.color} onChange={(event) => updateSocial(platform.id, 'color', event.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Texto del perfil</label>
              <textarea className="form-control" rows={2} value={platform.profileDescription} onChange={(event) => updateSocial(platform.id, 'profileDescription', event.target.value)} />
            </div>
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label small fw-semibold mb-0">Imágenes de galería</label>
                <button type="button" className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={() => updateSocial(platform.id, 'images', [...platform.images, ''])}>
                  <Plus size={14} /> Añadir imagen
                </button>
              </div>
              {platform.images.map((image, index) => (
                <div className="input-group input-group-sm mb-2" key={`${platform.id}-image-${index}`}>
                  <input className="form-control" value={image} onChange={(event) => updateGallery(platform, index, event.target.value)} placeholder="URL o ruta de imagen" />
                  <button type="button" className="btn btn-outline-danger" onClick={() => updateSocial(platform.id, 'images', platform.images.filter((_, imageIndex) => imageIndex !== index))} aria-label="Quitar imagen" title="Quitar imagen"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </form>
  );
};

export default RedesSocialesAdmin;