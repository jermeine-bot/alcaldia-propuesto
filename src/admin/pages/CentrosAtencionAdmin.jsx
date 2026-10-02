import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { MapPin, Plus, Save, Trash2 } from 'lucide-react';
import { apiService } from '../../services/apiService';

const createCenter = () => ({
  id: `centro-${Date.now()}`,
  title: '',
  description: '',
  image: '',
  mapsUrl: '',
  coordinates: ''
});

const CentrosAtencionAdmin = () => {
  const queryClient = useQueryClient();
  const { data: centers = [], isLoading } = useQuery({
    queryKey: ['centros-atencion'],
    queryFn: apiService.getCentrosAtencion
  });

  const saveMutation = useMutation({
    mutationFn: apiService.saveCentrosAtencion,
    onSuccess: (saved) => {
      queryClient.setQueryData(['centros-atencion'], saved);
      Swal.fire({ icon: 'success', title: 'Centros actualizados', timer: 1300, showConfirmButton: false });
    },
    onError: (error) => Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.message })
  });

  const updateCenter = (id, field, value) => {
    queryClient.setQueryData(['centros-atencion'], (items = []) =>
      items.map((center) => center.id === id ? { ...center, [field]: value } : center)
    );
  };

  const addCenter = () => queryClient.setQueryData(['centros-atencion'], (items = []) => [...items, createCenter()]);

  const removeCenter = (id) => {
    queryClient.setQueryData(['centros-atencion'], (items = []) => items.filter((center) => center.id !== id));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (centers.some((center) => !center.title.trim() || !center.description.trim() || !center.mapsUrl.trim())) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Cada centro necesita nombre, descripción y enlace de mapa.' });
      return;
    }
    saveMutation.mutate(centers);
  };

  if (isLoading) return <div className="text-center py-5"><div className="spinner-border text-danger" /></div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-card mb-4">
        <div className="admin-card-header flex-wrap gap-2">
          <h5 className="admin-card-title mb-0 d-flex align-items-center gap-2"><MapPin size={21} className="text-danger" /> Centros de Atención</h5>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2" onClick={addCenter}>
              <Plus size={15} /> Agregar centro
            </button>
            <button type="submit" className="btn btn-admin-primary btn-sm d-flex align-items-center gap-2" disabled={saveMutation.isPending}>
              <Save size={15} /> {saveMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
        <p className="text-muted small mb-0">Estos datos se muestran en la sección pública de Centros de Atención Tributaria.</p>
      </div>

      {centers.map((center, index) => (
        <section className="admin-card mb-3" key={center.id}>
          <div className="admin-card-header">
            <h6 className="admin-card-title mb-0">Centro {index + 1}</h6>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeCenter(center.id)} aria-label={`Eliminar ${center.title || `centro ${index + 1}`}`} title="Eliminar centro">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Nombre del centro</label>
              <input className="form-control" value={center.title} onChange={(event) => updateCenter(center.id, 'title', event.target.value)} required />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">URL de la fotografía</label>
              <input className="form-control" type="url" value={center.image} onChange={(event) => updateCenter(center.id, 'image', event.target.value)} placeholder="https://... o ruta /img/..." />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Etiqueta</label>
              <input className="form-control" value={center.serviceLabel || ''} onChange={(event) => updateCenter(center.id, 'serviceLabel', event.target.value)} placeholder="Atención tributaria" />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Descripción</label>
              <textarea className="form-control" rows={2} value={center.description} onChange={(event) => updateCenter(center.id, 'description', event.target.value)} required />
            </div>
            <div className="col-12 col-md-8">
              <label className="form-label small fw-semibold">Enlace de Google Maps</label>
              <input className="form-control" type="url" value={center.mapsUrl} onChange={(event) => updateCenter(center.id, 'mapsUrl', event.target.value)} required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Coordenadas</label>
              <input className="form-control" value={center.coordinates || ''} onChange={(event) => updateCenter(center.id, 'coordinates', event.target.value)} placeholder="12.4354, -86.8790" />
            </div>
          </div>
        </section>
      ))}
    </form>
  );
};

export default CentrosAtencionAdmin;