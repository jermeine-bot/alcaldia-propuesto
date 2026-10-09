import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const Header = ({ onOpenSearch }) => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Highlight active section
      const sections = ['hero', 'noticias', 'autoridades', 'servicios', 'estadisticas', 'proyectos', 'redes-sociales', 'turismo', 'centros-atencion', 'contacto'];
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerHeight = 70;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header id="mainHeader" className={scrolled ? 'header-scrolled' : ''}>
      <nav className="navbar navbar-expand-xl">
        <div className="container header-container">
          
          {/* PRIMER LOGO PRINCIPAL EN EL EXTREMO IZQUIERDO */}
          <a className="navbar-brand main-brand" href="#hero" onClick={(e) => handleNavClick(e, 'hero')}>
            <img 
              src="/img/nav_logo/logo%20principal.png" 
              alt="Logo Principal Alcaldía de León" 
              className="logo-img main-logo-img" 
              onError={(e) => { e.target.src = '/img/logo.png'; }} 
            />
            <div className="logo-text-group">
              <span className="logo-title">ALCALDÍA DE <strong>LEÓN</strong></span>
              <span className="logo-subtitle">Gobierno Municipal</span>
            </div>
          </a>

          {/* CONTENEDOR DERECHO: AGRUPA EL LOGO SECUNDARIO Y EL BOTÓN HAMBURGUESA EN MÓVIL */}
          <div className="d-flex align-items-center ms-auto">
            <div className="header-sublogos-right me-2">
              <img 
                src="/img/nav_logo/logo%20nav2.png" 
                alt="Escudo Alcaldía de León" 
                className="logo-img sublogo-img-right" 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            </div>

            {/* BOTÓN MÓVIL TOGGLER (AHORA FIJO EN LA ESQUINA DERECHA) */}
            <button
              className="navbar-toggler ms-2"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          {/* MENÚ NAVEGACIÓN CENTRADO Y ACOMODADO */}
          <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="mainNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <a className={`nav-link ${activeSection === 'hero' ? 'active' : ''}`} href="#hero" onClick={(e) => handleNavClick(e, 'hero')}>Inicio</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === 'noticias' ? 'active' : ''}`} href="#noticias" onClick={(e) => handleNavClick(e, 'noticias')}>Noticias</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === 'autoridades' ? 'active' : ''}`} href="#autoridades" onClick={(e) => handleNavClick(e, 'autoridades')}>Autoridades</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === 'servicios' ? 'active' : ''}`} href="#servicios" onClick={(e) => handleNavClick(e, 'servicios')}>Servicios</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === 'estadisticas' ? 'active' : ''}`} href="#estadisticas" onClick={(e) => handleNavClick(e, 'estadisticas')}>Población</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === 'proyectos' ? 'active' : ''}`} href="#proyectos" onClick={(e) => handleNavClick(e, 'proyectos')}>Proyectos</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === 'redes-sociales' ? 'active' : ''}`} href="#redes-sociales" onClick={(e) => handleNavClick(e, 'redes-sociales')}>Seguidores</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === 'turismo' ? 'active' : ''}`} href="#turismo" onClick={(e) => handleNavClick(e, 'turismo')}>Turismo</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === 'centros-atencion' ? 'active' : ''}`} href="#centros-atencion" onClick={(e) => handleNavClick(e, 'centros-atencion')}>Centros de Atención</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeSection === 'contacto' ? 'active' : ''}`} href="#contacto" onClick={(e) => handleNavClick(e, 'contacto')}>Contacto</a>
              </li>
            </ul>
          </div>

        </div>
      </nav>
    </header>
  );
};

export default Header;