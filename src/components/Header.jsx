import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header = ({ onOpenSearch }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isHome = location.pathname === '/';
  const isProjectsPage = location.pathname === '/proyectos';
  const isNoticiasPage = location.pathname === '/noticias';
  const isCulturaPage = location.pathname === '/cultura';
  const isGaleriaPage = location.pathname === '/galeria';

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setActiveSection('');
      return undefined;
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      const sections = ['hero', 'noticias', 'autoridades', 'servicios', 'estadisticas', 'redes-sociales', 'turismo', 'centros-atencion', 'contacto'];
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
  }, [isHome]);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (!isHome) {
      navigate(`/#${targetId}`);
      return;
    }

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

          <div className="d-flex align-items-center ms-auto">
            <div className="header-sublogos-right me-2">
              <img 
                src="/img/nav_logo/logo%20nav2.png" 
                alt="Escudo Alcaldía de León" 
                className="logo-img sublogo-img-right" 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            </div>

            <button
              className="navbar-toggler ms-2"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="mainNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <a className={`nav-link ${isHome && activeSection === 'hero' ? 'active' : ''}`} href="#hero" onClick={(e) => handleNavClick(e, 'hero')}>Inicio</a>
              </li>
              
              <li className="nav-item">
                <Link
                  className={`nav-link ${isNoticiasPage ? 'active' : ''}`}
                  to="/noticias"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Noticias
                </Link>
              </li>

              <li className="nav-item">
                <a className={`nav-link ${isHome && activeSection === 'autoridades' ? 'active' : ''}`} href="#autoridades" onClick={(e) => handleNavClick(e, 'autoridades')}>Autoridades</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${isHome && activeSection === 'servicios' ? 'active' : ''}`} href="#servicios" onClick={(e) => handleNavClick(e, 'servicios')}>Servicios</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${isHome && activeSection === 'estadisticas' ? 'active' : ''}`} href="#estadisticas" onClick={(e) => handleNavClick(e, 'estadisticas')}>Población</a>
              </li>
              
              <li className="nav-item">
                <Link
                  className={`nav-link ${isProjectsPage ? 'active' : ''}`}
                  to="/proyectos"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Proyectos
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${isCulturaPage ? 'active' : ''}`}
                  to="/cultura"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cultura
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className={`nav-link ${isGaleriaPage ? 'active' : ''}`}
                  to="/galeria"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Galería
                </Link>
              </li>

              <li className="nav-item">
                <a className={`nav-link ${isHome && activeSection === 'turismo' ? 'active' : ''}`} href="#turismo" onClick={(e) => handleNavClick(e, 'turismo')}>Turismo</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${isHome && activeSection === 'contacto' ? 'active' : ''}`} href="#contacto" onClick={(e) => handleNavClick(e, 'contacto')}>Contacto</a>
              </li>
            </ul>
          </div>

        </div>
      </nav>
    </header>
  );
};

export default Header;