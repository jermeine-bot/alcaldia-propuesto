import React from 'react';
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
  ArrowLeft
} from 'lucide-react';
 
const AdminSidebar = () => {
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
    <aside className="admin-sidebar">
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

      <ul className="admin-sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path} className="admin-nav-item">
              <NavLink
                to={item.path}
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
  );
};

export default AdminSidebar;
