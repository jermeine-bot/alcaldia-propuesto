import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

const Contacto = () => {
  const { data: contacto } = useQuery({
    queryKey: ['contacto'],
    queryFn: apiService.getContacto
  });

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const address = contacto?.address || 'Palacio Municipal, León, Nicaragua';
  const phone = contacto?.phone || '+505 2315-0000';
  const email = contacto?.email || 'info@alcaldaleon.gob.ni';
  const schedule = contacto?.schedule || 'Lunes a Viernes: 8:00 AM - 4:00 PM';
  const facebook = contacto?.facebook || '#';
  const twitter = contacto?.twitter || '#';
  const instagram = contacto?.instagram || '#';
  const youtube = contacto?.youtube || '#';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nombre && formData.email && formData.mensaje) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
      }, 4000);
    }
  };

  return (
    <section id="contacto" className="contacto-section py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <span className="section-subtitle">Formulario de Denuncia Ciudadana</span>
          <h2 className="section-title">Denuncia Ciudadana</h2>
          <p className="section-description">Estamos aquí para servirte</p>
        </div>

        <div className="row g-5">
          <div className="col-lg-5">
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h6>Dirección</h6>
                  <p>{address}</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone-alt"></i>
                <div>
                  <h6>Teléfono</h6>
                  <p>{phone}</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h6>Email</h6>
                  <p>{email}</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h6>Horario</h6>
                  <p>{schedule}</p>
                </div>
              </div>

              <div className="social-links mt-4">
                <a href={facebook} className="social-link" aria-label="Facebook" target="_blank" rel="noreferrer"><i className="fab fa-facebook-f"></i></a>
                <a href={twitter} className="social-link" aria-label="Twitter" target="_blank" rel="noreferrer"><i className="fab fa-twitter"></i></a>
                <a href={instagram} className="social-link" aria-label="Instagram" target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i></a>
                <a href={youtube} className="social-link" aria-label="YouTube" target="_blank" rel="noreferrer"><i className="fab fa-youtube"></i></a>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            {submitted ? (
              <div className="alert alert-success p-4 rounded-3 text-center" role="alert">
                <i className="fas fa-check-circle display-4 mb-3 text-success"></i>
                <h4>¡Mensaje Enviado con Éxito!</h4>
                <p className="mb-0">Gracias por comunicarte con la Alcaldía Municipal de León. Te responderemos a la brevedad.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      placeholder="Nombre completo"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Correo electrónico"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="text"
                      name="asunto"
                      className="form-control"
                      placeholder="Asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      name="mensaje"
                      className="form-control"
                      rows="5"
                      placeholder="Mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                      Enviar mensaje
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacto;
