import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

const Footer = () => {
  const navigate = useNavigate();
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [subscribedMessage, setSubscribedMessage] = useState(false);
  const { data: contacto } = useQuery({
    queryKey: ['contacto'],
    queryFn: apiService.getContacto
  });

  const facebook = contacto?.facebook || 'https://www.facebook.com/share/1EJ2g1UpjY/';
  const instagram = contacto?.instagram || 'https://www.instagram.com/alcaldia_leon';
  const tiktok = contacto?.tiktok || 'https://www.tiktok.com/@leonalcaldia';
  const youtube = contacto?.youtube || 'https://www.youtube.com/@AlcaldiaLeon';
  const twitter = contacto?.twitter || 'https://twitter.com/alcaldia_leon';

  // Función que redirige al panel de login administrativo al hacer doble clic
  const handleDoubleClick = () => {
    navigate('/admin/login'); 
  };

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
              <Link to="/#hero" className="d-inline-flex align-items-center gap-2 mb-3 text-decoration-none">
                <img 
                  src="/img/nav_logo/logo%20principal.png" 
                  alt="Alcaldía de León" 
                  className="footer-logo" 
                  onError={(e) => { e.target.src = '/img/logo.png'; }} 
                />
              </Link>
              <h4 className="fw-bold text-white mb-2">
                Alcaldía Municipal de{' '}
                <Link to="/" className="text-decoration-none">
                  <span 
                    className="text-danger"
                    onDoubleClick={handleDoubleClick}
                    style={{ cursor: 'pointer' }}
                  >
                    León
                  </span>
                </Link>
              </h4>
              <p className="text-white-50 small mb-3">
                Santiago de los Caballeros de León. Gobierno local comprometido con el desarrollo sostenible, la cultura y la transparencia.
              </p>
              <div className="footer-social-icons d-flex gap-2">
                <a href={facebook} target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href={instagram} target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href={tiktok} target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="TikTok">
                  <i className="fab fa-tiktok"></i>
                </a>
                <a href={youtube} target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href={twitter} target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Twitter / X">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>
          </div>

          {/* ENLACES RÁPIDOS */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="footer-title">Enlaces Rápidos</h6>
            <ul className="footer-links">
              <li><Link to="/#hero"><i className="fas fa-chevron-right me-1 small text-danger"></i>Inicio</Link></li>
              <li><Link to="/#noticias"><i className="fas fa-chevron-right me-1 small text-danger"></i>Noticias</Link></li>
              <li><Link to="/#autoridades"><i className="fas fa-chevron-right me-1 small text-danger"></i>Autoridades</Link></li>
              <li><Link to="/#servicios"><i className="fas fa-chevron-right me-1 small text-danger"></i>Servicios</Link></li>
              <li><Link to="/proyectos"><i className="fas fa-chevron-right me-1 small text-danger"></i>Proyectos</Link></li>
            </ul>
          </div>

          {/* INFORMACIÓN Y COMUNIDAD */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="footer-title">Información Oficial</h6>
            <ul className="footer-links">
              <li><Link to="/#estadisticas"><i className="fas fa-chevron-right me-1 small text-danger"></i>Población y Datos</Link></li>
              <li><Link to="/#turismo"><i className="fas fa-chevron-right me-1 small text-danger"></i>Turismo y Cultura</Link></li>
              <li><Link to="/#centros-atencion"><i className="fas fa-chevron-right me-1 small text-danger"></i>Centros de Atención</Link></li>
              <li><Link to="/#redes-sociales"><i className="fas fa-chevron-right me-1 small text-danger"></i>Comunidad Digital</Link></li>
              <li><Link to="/#contacto"><i className="fas fa-chevron-right me-1 small text-danger"></i>Atención al Ciudadano</Link></li>
            </ul>
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