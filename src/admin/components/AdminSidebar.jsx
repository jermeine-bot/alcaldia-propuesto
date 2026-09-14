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
  X
} from 'lucide-react';

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Por defecto cerrado en móvil/tablet

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Función para cerrar el aside específicamente al hacer clic en logo2 (en móviles/tablets o en general)
  const handleLogo2Click = () => {
    // Si estamos en vista móvil/tablet o queremos que toggle funcione, podemos usar toggleSidebar o forzar cierre si prefieres:
    // Para cumplir con "a la hora de cerrar el aside se toque la imagen logo2":
    setIsOpen(false);
    // Si deseas que también actúe como interruptor (abrir/cerrar), puedes cambiarlo por toggleSidebar();
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
    { path: '/admin/contacto', label: 'Información de Contacto', icon: PhoneCall },
  ];

  return (
    <>
      {/* Botón hamburguesa para móvil y tablet */}
      <button 
        className="admin-mobile-toggle-btn" 
        onClick={toggleSidebar}
        aria-label="Abrir menú"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para oscurecer el fondo al abrir en móvil (opcional para UX, pero seguro) */}
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

        {/* Imagen centrada que actúa para cerrar el aside al tocarla */}
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
                  onClick={() => setIsOpen(false)} // Cierra el menú al hacer clic en una opción en móvil
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