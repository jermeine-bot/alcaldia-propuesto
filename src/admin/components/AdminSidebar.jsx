import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Image,
  Newspaper,
  Building2,
  Palmtree,
  CalendarDays,
  BarChart3,
  PhoneCall,
  Briefcase,
  Menu,
  MapPin,
  Share2
} from 'lucide-react';

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Por defecto cerrado en móvil/tablet

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogo2Click = () => {
    setIsOpen(false);
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/hero', label: 'Portada / Hero', icon: Image },
    { path: '/admin/servicios', label: 'Trámites y Servicios', icon: Briefcase },
    { path: '/admin/noticias', label: 'Noticias', icon: Newspaper },
    { path: '/admin/proyectos', label: 'Proyectos Municipales', icon: Building2 },
    { path: '/admin/turismo', label: 'Turismo', icon: Palmtree },
    { path: '/admin/cultural', label: 'Agenda Cultural', icon: CalendarDays },
    { path: '/admin/estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { path: '/admin/centros-atencion', label: 'Centros de Atención', icon: MapPin },
    { path: '/admin/redes-sociales', label: 'Redes Sociales', icon: Share2 },
    { path: '/admin/contacto', label: 'Información de Contacto', icon: PhoneCall },
  ];

  return (
    <>
      {/* Botón hamburguesa solo se muestra si el aside está CERRADO (!isOpen) */}
      {!isOpen && (
        <button 
          className="admin-mobile-toggle-btn" 
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay para oscurecer el fondo al abrir en móvil */}
      {isOpen && <div className="admin-sidebar-overlay" onClick={toggleSidebar}></div>}

      <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <img
            src="/img/nav_logo/logo nav2.png"
            alt="Alcaldía de León"
            className="admin-sidebar-logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/public/img/nav_logo/logo principal.png';
            }}
          />
        </div>

        {/* Imagen centrada para cerrar el aside al tocarla */}
        <div className="admin-sidebar-logo2-container">
          <img
            src="/img/nav_logo/leon2d.png"
            alt="Leon"
            className="admin-sidebar-logo2"
            onClick={handleLogo2Click}
            title="Hacer clic para cerrar el menú"
          />
        </div>

        <ul className="admin-sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="admin-nav-item">
                <NavLink
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
};

export default AdminSidebar;