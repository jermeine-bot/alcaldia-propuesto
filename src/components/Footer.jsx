import React, { useState } from 'react';

const Footer = () => {
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [subscribedMessage, setSubscribedMessage] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (subscribedEmail) {
      setSubscribedMessage(true);
      setTimeout(() => {
        setSubscribedMessage(false);
        setSubscribedEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row g-4 pb-4">
          
          {/* MARCA Y LOGO PRINCIPAL DEL FOOTER */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand">
              <a href="#hero" className="d-inline-flex align-items-center gap-2 mb-3 text-decoration-none">
                <img 
                  src="/img/nav_logo/logo%20principal.png" 
                  alt="Alcaldía de León" 
                  className="footer-logo" 
                  onError={(e) => { e.target.src = '/img/logo.png'; }} 
                />
              </a>
              <h4 className="fw-bold text-white mb-2">Alcaldía Municipal de <span className="text-danger">León</span></h4>
              <p className="text-white-50 small mb-3">
                Santiago de los Caballeros de León. Gobierno local comprometido con el desarrollo sostenible, la cultura y la transparencia.
              </p>
              <div className="footer-social-icons d-flex gap-2">
                <a href="https://www.facebook.com/share/1EJ2g1UpjY/" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://www.instagram.com/alcaldia_leon" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://www.tiktok.com/@leonalcaldia" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="TikTok">
                  <i className="fab fa-tiktok"></i>
                </a>
                <a href="https://www.youtube.com/@AlcaldiaLeon" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>

          {/* ENLACES RÁPIDOS */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="footer-title">Enlaces Rápidos</h6>
            <ul className="footer-links">
              <li><a href="#hero"><i className="fas fa-chevron-right me-1 small text-danger"></i>Inicio</a></li>
              <li><a href="#noticias"><i className="fas fa-chevron-right me-1 small text-danger"></i>Noticias</a></li>
              <li><a href="#autoridades"><i className="fas fa-chevron-right me-1 small text-danger"></i>Autoridades</a></li>
              <li><a href="#servicios"><i className="fas fa-chevron-right me-1 small text-danger"></i>Servicios</a></li>
              <li><a href="#proyectos"><i className="fas fa-chevron-right me-1 small text-danger"></i>Proyectos</a></li>
            </ul>
          </div>

          {/* INFORMACIÓN Y COMUNIDAD */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="footer-title">Información Oficial</h6>
            <ul className="footer-links">
              <li><a href="#estadisticas"><i className="fas fa-chevron-right me-1 small text-danger"></i>Población y Datos</a></li>
              <li><a href="#turismo"><i className="fas fa-chevron-right me-1 small text-danger"></i>Turismo y Cultura</a></li>
              <li><a href="#transparencia"><i className="fas fa-chevron-right me-1 small text-danger"></i>Transparencia</a></li>
              <li><a href="#redes-sociales"><i className="fas fa-chevron-right me-1 small text-danger"></i>Comunidad Digital</a></li>
              <li><a href="#contacto"><i className="fas fa-chevron-right me-1 small text-danger"></i>Atención al Ciudadano</a></li>
            </ul>
          </div>

          {/* BOLETÍN Y SUSCRIPCIÓN */}
          <div className="col-lg-3 col-md-6">
            <h6 className="footer-title">Boletín Informativo</h6>
            <p className="text-white-50 small mb-3">Recibe notificaciones sobre comunicados, eventos y proyectos municipales.</p>
            {subscribedMessage ? (
              <div className="alert alert-success py-2 px-3 small fw-bold mb-0 rounded-pill text-center">
                <i className="fas fa-check-circle me-1"></i> ¡Gracias por suscribirte!
              </div>
            ) : (
              <form className="footer-subscribe" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={subscribedEmail}
                  onChange={(e) => setSubscribedEmail(e.target.value)}
                  required
                />
                <button type="submit" aria-label="Suscribir">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* PIE DE PÁGINA INFERIOR: LOGO IZQUIERDA | TEXTO CENTRO | LOGO DERECHA */}
        <div className="footer-bottom py-4 border-top border-secondary border-opacity-25">
          <div className="row align-items-center justify-content-between g-3">
            
            {/* PRIMER LOGO A LA IZQUIERDA */}
            <div className="col-md-3 col-6 text-center text-md-start">
              <img 
                src="/img/footer_logos/logo1.png" 
                alt="Logo Footer Institucional 1" 
                className="footer-logo-large" 
                onError={(e) => { e.target.src = '/img/nav_logo/logo%20nav2.png'; }} 
              />
            </div>

            {/* DERECHOS EN EL CENTRO */}
            <div className="col-md-6 col-12 text-center my-2 my-md-0">
              <p className="text-white-50 small mb-0">
                &copy; {new Date().getFullYear()} <strong>Alcaldía Municipal de León</strong>. Todos los derechos reservados.
              </p>
            </div>

            {/* SEGUNDO LOGO A LA DERECHA */}
            <div className="col-md-3 col-6 text-center text-md-end">
              <img 
                src="/img/footer_logos/image.png" 
                alt="Logo Footer Institucional 2" 
                className="footer-logo-large" 
                onError={(e) => { e.target.src = '/img/nav_logo/logo2.png'; }} 
              />
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;




