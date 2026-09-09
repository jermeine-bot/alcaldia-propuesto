import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { PhoneCall, Save, MapPin, Mail, Clock, Share2 } from 'lucide-react';
import { apiService } from '../../services/apiService';

const ContactoAdmin = () => {
  const queryClient = useQueryClient();

  const { data: contactoData, isLoading } = useQuery({
    queryKey: ['contacto'],
    queryFn: apiService.getContacto
  });

  const [formData, setFormData] = useState({
    address: 'Palacio Municipal, León, Nicaragua',
    phone: '+505 2315-0000',
    email: 'info@alcaldaleon.gob.ni',
    schedule: 'Lunes a Viernes: 8:00 AM - 4:00 PM',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com',
    youtube: 'https://youtube.com',
    twitter: 'https://twitter.com'
  });

  useEffect(() => {
    if (contactoData) {
      setFormData((prev) => ({
        ...prev,
        ...contactoData
      }));
    }
  }, [contactoData]);

  const mutation = useMutation({
    mutationFn: apiService.updateContacto,
    onSuccess: () => {
      queryClient.invalidateQueries(['contacto']);
      Swal.fire({
        icon: 'success',
        title: 'Información Actualizada',
        text: 'Los datos institucionales de contacto y redes se actualizaron correctamente.',
        confirmButtonColor: '#B22222'
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: err.message || 'No se pudo actualizar la información.',
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
        <div className="mt-2 text-muted">Cargando datos de contacto...</div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-xl-10">
        <div className="admin-card">
          <div className="admin-card-header">
            <h5 className="admin-card-title d-flex align-items-center gap-2">
              <PhoneCall size={22} className="text-danger" />
              Configuración de Información Institucional y Contacto
            </h5>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2 pt-2">
                <MapPin size={18} className="text-danger" />
                Datos Principales de Atención
              </h6>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Dirección del Palacio Municipal</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Teléfono Oficial</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Correo Electrónico Oficial</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Horario de Atención Ciudadana</label>
                <input
                  type="text"
                  name="schedule"
                  className="form-control"
                  value={formData.schedule || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2 pt-4 border-top">
                <Share2 size={18} className="text-danger" />
                Redes Sociales Oficiales
              </h6>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Facebook URL</label>
                <input
                  type="url"
                  name="facebook"
                  className="form-control"
                  value={formData.facebook || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Instagram URL</label>
                <input
                  type="url"
                  name="instagram"
                  className="form-control"
                  value={formData.instagram || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">TikTok URL</label>
                <input
                  type="url"
                  name="tiktok"
                  className="form-control"
                  value={formData.tiktok || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">YouTube URL</label>
                <input
                  type="url"
                  name="youtube"
                  className="form-control"
                  value={formData.youtube || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Twitter / X URL</label>
                <input
                  type="url"
                  name="twitter"
                  className="form-control"
                  value={formData.twitter || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-top d-flex justify-content-end">
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
                    <span>Guardar Información</span>
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

export default ContactoAdmin;
